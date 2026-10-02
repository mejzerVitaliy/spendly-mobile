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

// weekly_summary/monthly_recap/streak/inactivity/daily_checkin used to have
// entries here too, but this client no longer sends any of those itself -
// the server's own, separate cooldown table now owns them (daily_checkin,
// the "remind me to log a transaction" push, moved server-side because a
// local schedule only ever re-armed itself when the user reopened the app,
// so it silently stopped firing at all for anyone who went quiet - see
// notification-dispatch.service.ts dispatchDueReminders on the API).
const COOLDOWN_HOURS: Record<string, number> = {
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
) {
  if (isOnCooldown(type)) return;
  recordCooldown(type);
  // Always log in-app regardless of push preference
  addInAppNotification(type, titleKey, bodyKey, bodyParams);

  if (!isPushAllowed()) return;

  // Every remaining local type fires immediately (trigger: null) - nothing
  // left here schedules ahead of time (the one that did, the daily
  // check-in reminder, is now a server-dispatched push instead).
  await Notifications.scheduleNotificationAsync({
    content: { title, body, sound: true, data: { type } },
    trigger: null,
  });
}

export const notificationService = {
  /**
   * Called when the OS actually delivers a notification this client didn't
   * just add to the in-app list itself when sending it - i.e. a real
   * server-dispatched push (reminder/streak/inactivity/weekly/monthly -
   * see notification-dispatch.service.ts on the API), which carries its
   * own titleKey/bodyKey/bodyParams in `data` for exactly this. Only
   * covers the case where the app was open (foreground/background with
   * the JS runtime alive) when it arrived - syncNotificationHistory below
   * is what backfills one that arrived while fully closed. Every local
   * type already added its entry synchronously inside sendLocal, so this
   * only ever runs for server-dispatched ones.
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

  async enablePush() {
    useNotificationsStore.getState().setPushNotificationsEnabled(true);
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
   * Called after each transaction creation to update tracking data.
   *
   * The streak *push* (and, as of the server-side reminder, the "don't
   * forget to log a transaction" push too) used to be sent from right here,
   * locally - both now come from the server's dispatch job instead (see
   * notification-dispatch.service.ts on the API), which is the only way
   * either can reach a closed app. The local, app-open-triggered daily
   * check-in used to re-arm itself here on every create, which is exactly
   * what made it silently stop firing at all once someone went a while
   * without opening the app - the server dispatch instead just checks "did
   * this user log something today" fresh on every run, independent of
   * whether the app has been opened recently. currentStreak/
   * lastTransactionDate are still tracked locally because other
   * client-only features read them (the guest-registration nudge in
   * guest-register-modal.tsx).
   */
  async onTransactionCreated() {
    const today = new Date().toISOString().slice(0, 10);
    const store = useNotificationsStore.getState();
    store.setLastTransactionDate(today);
    store.updateStreak(today);
  },

  /**
   * Backfills the in-app notification list with anything the server
   * actually dispatched (reminder/streak/inactivity/weekly/monthly) that
   * this client's own addNotificationReceivedListener never saw -  that
   * listener only fires while the JS runtime is alive, so a push delivered
   * while the app was fully closed shows as a system banner but was
   * previously never recorded in-app. Call on app open, after permissions/
   * push registration resolve.
   */
  async syncNotificationHistory() {
    try {
      const { data } = await notificationsApi.getHistory();
      useNotificationsStore.getState().mergeServerNotifications(data);
    } catch {
      // best-effort - the live listener still covers same-session pushes
    }
  },

  /**
   * Tier 3 of the guest-registration nudge: a push warning a guest that
   * their data lives only on this device. Called on app open, gated on
   * guest status + transaction count.
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
