import * as Notifications from 'expo-notifications';
import { useNotificationsStore , NotificationType } from '@/shared/stores/notifications';

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

const COOLDOWN_HOURS: Record<string, number> = {
  daily_checkin: 20,
  weekly_summary: 6 * 24,
  monthly_recap: 20 * 24,
  streak: 23,
  inactivity: 22,
  spending_trend: 5 * 24,
  category_insight: 5 * 24,
  no_income: 7 * 24,
  recurring_due: 20,
};

const STREAK_MILESTONES = [3, 5, 7, 10, 14, 21, 30];

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
        data: { type: 'daily_checkin' },
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
   */
  async onTransactionCreated(i18nFn: (key: string) => string) {
    const today = new Date().toISOString().slice(0, 10);
    const store = useNotificationsStore.getState();
    store.setLastTransactionDate(today);
    store.updateStreak(today);

    // Cancel today's daily reminder — user already tracked
    await this.cancelDailyCheckIn();

    // Streak milestone notification
    const streak = useNotificationsStore.getState().currentStreak;
    if (STREAK_MILESTONES.includes(streak) && !isOnCooldown('streak')) {
      await sendLocal(
        'streak',
        i18nFn('notifications.streakTitle'),
        i18nFn('notifications.streakBody').replace('{{days}}', String(streak)),
        'notifications.streakTitle',
        'notifications.streakBody',
        { days: streak },
      );
    }
  },

  /**
   * Called on app open — evaluates all rules and schedules/cancels notifications.
   */
  async syncOnAppOpen(i18nFn: (key: string, params?: object) => string) {
    const store = useNotificationsStore.getState();
    const lastTx = store.lastTransactionDate;

    // Days since last transaction — null means user never tracked anything, skip inactivity
    const daysSinceTx = lastTx
      ? Math.floor((Date.now() - new Date(lastTx).getTime()) / 86400000)
      : null;

    // If user tracked today, cancel daily reminder; otherwise schedule it
    if (daysSinceTx === 0) {
      await this.cancelDailyCheckIn();
    } else {
      await this.scheduleDailyCheckIn(i18nFn);
    }

    // Inactivity re-engagement — only if user has tracked before AND hasn't for 2+ days
    if (daysSinceTx !== null && daysSinceTx >= 2 && !isOnCooldown('inactivity')) {
      const estimatedMissed = daysSinceTx * 3; // rough estimate
      await sendLocal(
        'inactivity',
        i18nFn('notifications.inactivityTitle'),
        i18nFn('notifications.inactivityBody').replace('{{days}}', String(daysSinceTx)),
        'notifications.inactivityTitle',
        'notifications.inactivityBody',
        { days: daysSinceTx, estimated: estimatedMissed },
      );
    }

    // Weekly summary — only on Sundays
    const dayOfWeek = new Date().getDay();
    if (dayOfWeek === 0 && !isOnCooldown('weekly_summary')) {
      await sendLocal(
        'weekly_summary',
        i18nFn('notifications.weeklySummaryTitle'),
        i18nFn('notifications.weeklySummaryBody'),
        'notifications.weeklySummaryTitle',
        'notifications.weeklySummaryBody',
      );
    }

    // Monthly recap — last 3 days of month
    const date = new Date();
    const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    if (date.getDate() >= lastDayOfMonth - 2 && !isOnCooldown('monthly_recap')) {
      await sendLocal(
        'monthly_recap',
        i18nFn('notifications.monthlyRecapTitle'),
        i18nFn('notifications.monthlyRecapBody'),
        'notifications.monthlyRecapTitle',
        'notifications.monthlyRecapBody',
      );
    }
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
