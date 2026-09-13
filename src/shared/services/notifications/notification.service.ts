import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { useNotificationsStore , NotificationType } from '@/shared/stores/notifications';
import { notificationsApi } from '@/shared/services/api';

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// weekly_summary/monthly_recap/streak/inactivity used to have entries here
// too, but this client no longer sends those itself (see syncOnAppOpen) -
// the server's own, separate cooldown table now owns them.
const COOLDOWN_HOURS: Record<string, number> = {
  daily_checkin: 20,
  spending_trend: 5 * 24,
  category_insight: 5 * 24,
  no_income: 7 * 24,
  recurring_due: 20,
  guest_data_risk: 14 * 24,
};

// Below this, a guest losing their device isn't losing much - the push
// exists to warn about real data loss, not to nag a brand new user.
const GUEST_DATA_RISK_TRANSACTION_THRESHOLD = 15;

function isOnCooldown(type: string): boolean {
  const cooldowns = useNotificationsStore.getState().cooldowns;
  const last = cooldowns[type];
  if (!last) return false;
  const hours = COOLDOWN_HOURS[type] ?? 24;
  return Date.now() - new Date(last).getTime() < hours * 3600 * 1000;
}

function recordCooldown(type: string) {
  useNotificationsStore.getState().setCooldown(type, new Date().toISOString());
}

function addInAppNotification(
  type: NotificationType,
  titleKey: string,
  bodyKey: string,
  bodyParams?: Record<string, string | number>,
) {
  useNotificationsStore.getState().addNotification({ type, titleKey, bodyKey, bodyParams });
}

function isPushAllowed(): boolean {
  const { permissionGranted, pushNotificationsEnabled } = useNotificationsStore.getState();
  return permissionGranted && pushNotificationsEnabled;
}

async function sendLocal(
  type: NotificationType,
  title: string,
  body: string,
  titleKey: string,
  bodyKey: string,
  bodyParams?: Record<string, string | number>,
  scheduleSeconds?: number,
) {
  if (isOnCooldown(type)) return;
  recordCooldown(type);
  // Always log in-app regardless of push preference
  addInAppNotification(type, titleKey, bodyKey, bodyParams);

  if (!isPushAllowed()) return;

  if (scheduleSeconds && scheduleSeconds > 0) {
    await Notifications.scheduleNotificationAsync({
      content: { title, body, sound: true, data: { type } },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: scheduleSeconds },
    });
  } else {
    await Notifications.scheduleNotificationAsync({
      content: { title, body, sound: true, data: { type } },
      trigger: null,
    });
  }
}

export const notificationService = {
  /**
   * Called when the OS actually delivers a notification this client didn't
   * just add to the in-app list itself when sending it - either the daily
   * check-in (the one local type genuinely scheduled ahead via a real
   * TIME_INTERVAL trigger) or a real server-dispatched push (streak/
   * inactivity/weekly/monthly - see notification-dispatch.service.ts on the
   * API), which carries its own titleKey/bodyKey/bodyParams in `data` for
   * exactly this. Every other local type already added its entry
   * synchronously inside sendLocal, so this only runs for these two cases.
   */
  recordRemoteNotificationDelivered(data: Record<string, unknown> | undefined) {
    const type = data?.type as NotificationType | undefined;
    const titleKey = data?.titleKey as string | undefined;
    const bodyKey = data?.bodyKey as string | undefined;
    if (!type || !titleKey || !bodyKey) return;

    addInAppNotification(type, titleKey, bodyKey, data?.bodyParams as Record<string, string | number> | undefined);
  },

  async sendRecurringDueNotification(i18nFn: (key: string, params?: object) => string, count: number) {
    await sendLocal(
      'recurring_due',
      i18nFn('notifications.recurringDueTitle'),
      i18nFn('notifications.recurringDueBody', { count }),
      'notifications.recurringDueTitle',
      'notifications.recurringDueBody',
      { count },
    );
  },

  async disablePush() {
    useNotificationsStore.getState().setPushNotificationsEnabled(false);
    await Notifications.cancelAllScheduledNotificationsAsync();
  },

  async enablePush(i18nFn: (key: string) => string) {
    useNotificationsStore.getState().setPushNotificationsEnabled(true);
    await this.scheduleDailyCheckIn(i18nFn);
  },

  /**
   * Registers this device for real server-dispatched push (streak/
   * inactivity/weekly/monthly - see notification-dispatch.service.ts on the
   * API) so those can reach the user even when the app is fully closed,
   * unlike the rest of this file's local, app-open-only notifications.
   * Best-effort: no permission, no EAS project id, or a network hiccup here
   * should never block anything else the app is doing.
   */
  async registerForServerPush(language?: 'en' | 'ru') {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') return;

      const projectId = Constants.expoConfig?.extra?.eas?.projectId as string | undefined;
      if (!projectId) return;

      const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
      await notificationsApi.registerPushToken({ token, language });
    } catch {
      // best-effort - local notifications still work regardless
    }
  },

  async unregisterForServerPush() {
    try {
      const projectId = Constants.expoConfig?.extra?.eas?.projectId as string | undefined;
      if (!projectId) return;

      const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
      await notificationsApi.unregisterPushToken({ token });
    } catch {
      // best-effort - logout should never be blocked by this
    }
  },

  async requestPermissions(): Promise<boolean> {
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === 'granted') {
      useNotificationsStore.getState().setPermissionGranted(true);
      return true;
    }
    if (existing === 'undetermined') {
      const { status } = await Notifications.requestPermissionsAsync();
      const granted = status === 'granted';
      useNotificationsStore.getState().setPermissionGranted(granted);
      return granted;
    }
    useNotificationsStore.getState().setPermissionGranted(false);
    return false;
  },

  /**
   * Schedule the daily check-in push for 20:00 today (or tomorrow if already past).
   * Cancelled on next sync if user already tracked today.
   */
  async scheduleDailyCheckIn(i18nFn: (key: string) => string) {
    await Notifications.cancelAllScheduledNotificationsAsync();

    const now = new Date();
    const fire = new Date(now);
    fire.setHours(20, 0, 0, 0);
    if (fire <= now) fire.setDate(fire.getDate() + 1);
    const seconds = Math.round((fire.getTime() - now.getTime()) / 1000);

    if (!isPushAllowed()) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: i18nFn('notifications.dailyCheckinTitle'),
        body: i18nFn('notifications.dailyCheckinBody'),
        sound: true,
        data: {
          type: 'daily_checkin',
          titleKey: 'notifications.dailyCheckinTitle',
          bodyKey: 'notifications.dailyCheckinBody',
        },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds,
        repeats: false,
      },
    });
  },

  async cancelDailyCheckIn() {
    // Cancel all and re-schedule for tomorrow (user already tracked today)
    await Notifications.cancelAllScheduledNotificationsAsync();
  },

  /**
   * Called after each transaction creation to update tracking data.
   *
   * The streak *push* used to be sent from right here, locally - it now
   * comes from the server's daily dispatch job instead (see
   * notification-dispatch.service.ts on the API), which is the only way a
   * streak/inactivity/weekly/monthly notification can reach a closed app.
   * currentStreak/lastTransactionDate are still tracked locally because
   * other client-only features read them (the daily check-in scheduling
   * below, and the guest-registration nudge in guest-register-modal.tsx) -
   * only the redundant local push send was removed, to avoid the same
   * milestone firing twice from two independently-cooldown'd systems.
   */
  async onTransactionCreated() {
    const today = new Date().toISOString().slice(0, 10);
    const store = useNotificationsStore.getState();
    store.setLastTransactionDate(today);
    store.updateStreak(today);

    // Cancel today's daily reminder — user already tracked
    await this.cancelDailyCheckIn();
  },

  /**
   * Called on app open. Used to also fire the inactivity/weekly/monthly
   * pushes locally - those are now the server's job (see
   * notification-dispatch.service.ts on the API), since a local, app-open-
   * only send can never reach a closed app in the first place, and running
   * both would just double-send the same milestone under two independent
   * cooldowns. This now only handles the daily check-in reminder, which
   * stays a genuine local OS-scheduled trigger.
   */
  async syncOnAppOpen(i18nFn: (key: string, params?: object) => string) {
    const store = useNotificationsStore.getState();
    const lastTx = store.lastTransactionDate;

    const daysSinceTx = lastTx
      ? Math.floor((Date.now() - new Date(lastTx).getTime()) / 86400000)
      : null;

    // If user tracked today, cancel daily reminder; otherwise schedule it
    if (daysSinceTx === 0) {
      await this.cancelDailyCheckIn();
    } else {
      await this.scheduleDailyCheckIn(i18nFn);
    }
  },

  /**
   * Tier 3 of the guest-registration nudge: a push warning a guest that
   * their data lives only on this device. Called on app open, separately
   * from syncOnAppOpen, so it can be gated on guest status + transaction
   * count (context syncOnAppOpen doesn't have) without touching that
   * method's signature.
   */
  async maybeSendGuestDataRiskNotification(
    i18nFn: (key: string, params?: object) => string,
    isGuest: boolean,
    transactionCount: number,
  ) {
    if (!isGuest || transactionCount < GUEST_DATA_RISK_TRANSACTION_THRESHOLD) return;
    if (isOnCooldown('guest_data_risk')) return;

    await sendLocal(
      'guest_data_risk',
      i18nFn('notifications.guestDataRiskTitle'),
      i18nFn('notifications.guestDataRiskBody').replace('{{count}}', String(transactionCount)),
      'notifications.guestDataRiskTitle',
      'notifications.guestDataRiskBody',
      { count: transactionCount },
    );
  },

  /**
   * Trigger spending trend insight notification (called from analytics/reports).
   */
  async sendSpendingTrendNotification(
    i18nFn: (key: string) => string,
    pctChange: number,
  ) {
    if (Math.abs(pctChange) < 10) return;
    if (isOnCooldown('spending_trend')) return;

    const direction = pctChange > 0 ? '+' : '';
    const body = i18nFn('notifications.spendingTrendBody').replace('{{pct}}', `${direction}${Math.round(pctChange)}%`);
    await sendLocal(
      'spending_trend',
      i18nFn('notifications.spendingTrendTitle'),
      body,
      'notifications.spendingTrendTitle',
      'notifications.spendingTrendBody',
      { pct: pctChange },
    );
  },
};
