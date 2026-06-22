import { useNotificationsStore, AppNotification, NotificationType } from '@/shared/stores/notifications';
import { colors } from '@/shared/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

const ICON_MAP: Record<NotificationType, { name: string; color: string; bg: string }> = {
  daily_checkin: { name: 'today-outline', color: '#22D3EE', bg: 'rgba(34,211,238,0.12)' },
  weekly_summary: { name: 'bar-chart-outline', color: '#A78BFA', bg: 'rgba(167,139,250,0.12)' },
  monthly_recap: { name: 'calendar-outline', color: '#34D399', bg: 'rgba(52,211,153,0.12)' },
  streak: { name: 'flame-outline', color: '#FB923C', bg: 'rgba(251,146,60,0.12)' },
  inactivity: { name: 'refresh-outline', color: '#FBBF24', bg: 'rgba(251,191,36,0.12)' },
  spending_trend: { name: 'trending-up-outline', color: '#F87171', bg: 'rgba(248,113,113,0.12)' },
  category_insight: { name: 'pie-chart-outline', color: '#60A5FA', bg: 'rgba(96,165,250,0.12)' },
  no_income: { name: 'alert-circle-outline', color: '#FBBF24', bg: 'rgba(251,191,36,0.12)' },
  recurring_due: { name: 'repeat-outline', color: '#22D3EE', bg: 'rgba(34,211,238,0.12)' },
};

function timeAgo(isoDate: string, t: (k: string, p?: Record<string, unknown>) => string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return t('notifications.justNow');
  if (mins < 60) return t('notifications.minutesAgo', { count: mins });
  const hours = Math.floor(mins / 60);
  if (hours < 24) return t('notifications.hoursAgo', { count: hours });
  const days = Math.floor(hours / 24);
  return t('notifications.daysAgo', { count: days });
}

function NotificationRow({ n }: { n: AppNotification }) {
  const { t: tRaw } = useTranslation();
  const t = tRaw as unknown as (k: string, p?: Record<string, unknown>) => string;
  const { markRead } = useNotificationsStore();
  const icon = ICON_MAP[n.type] ?? ICON_MAP.daily_checkin;

  const handlePress = () => {
    markRead(n.id);
  };

  const title = t(n.titleKey);
  const body = n.bodyParams
    ? t(n.bodyKey, n.bodyParams as Record<string, unknown>)
    : t(n.bodyKey);

  return (
    <Pressable
      onPress={handlePress}
      className={`flex-row gap-3 px-4 py-4 border-b border-white/[0.06] active:opacity-70 ${!n.read ? 'bg-white/[0.03]' : ''}`}
    >
      <View
        className="w-10 h-10 rounded-[14px] items-center justify-center shrink-0 mt-0.5"
        style={{ backgroundColor: icon.bg }}
      >
        <Ionicons name={icon.name as any} size={20} color={icon.color} />
      </View>
      <View className="flex-1 gap-0.5">
        <View className="flex-row items-center justify-between gap-2">
          <Text className="text-[14px] font-semibold text-foreground flex-1">{title}</Text>
          {!n.read && (
            <View className="w-2 h-2 rounded-full bg-primary shrink-0" />
          )}
        </View>
        <Text className="text-[13px] text-muted-foreground leading-[18px]">{body}</Text>
        <Text className="text-[11px] text-muted-foreground/70 mt-1">{timeAgo(n.receivedAt, t)}</Text>
      </View>
    </Pressable>
  );
}

export function NotificationsScreen() {
  const { t } = useTranslation();
  const { notifications, markAllRead, clearAll } = useNotificationsStore();

  useEffect(() => {
    const timer = setTimeout(() => markAllRead(), 500);
    return () => clearTimeout(timer);
  }, [markAllRead]);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-2 pb-3 border-b border-white/[0.08]">
        <Pressable onPress={() => router.back()} className="w-9 h-9 items-center justify-center active:opacity-60">
          <Ionicons name="chevron-back" size={24} color={colors.foreground} />
        </Pressable>
        <Text className="text-[17px] font-bold text-foreground">{t('notifications.title')}</Text>
        <Pressable
          onPress={clearAll}
          className="h-9 px-2 items-center justify-center active:opacity-60"
        >
          <Text className="text-[13px] font-medium text-muted-foreground">{t('notifications.clearAll')}</Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {notifications.length === 0 ? (
          <View className="flex-1 items-center justify-center py-24 gap-3">
            <View className="w-16 h-16 rounded-[20px] bg-white/[0.06] items-center justify-center">
              <Ionicons name="notifications-outline" size={32} color={colors.mutedForeground} />
            </View>
            <Text className="text-[16px] font-semibold text-foreground">{t('notifications.empty')}</Text>
            <Text className="text-[13px] text-muted-foreground text-center px-8 leading-5">
              {t('notifications.emptyDesc')}
            </Text>
          </View>
        ) : (
          notifications.map((n) => <NotificationRow key={n.id} n={n} />)
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
