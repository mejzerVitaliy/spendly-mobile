import { useAiUsage } from '@/shared/hooks';
import { colors } from '@/shared/theme';
import { SettingsHeader } from '@/shared/ui';
import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

function UsageBar({ used, limit }: { used: number; limit: number }) {
  const pct = limit > 0 ? Math.min(used / limit, 1) : 0;
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(pct, { duration: 700 });
  }, [pct, progress]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  const barColor =
    pct >= 1 ? colors.destructive : pct >= 0.75 ? colors.warning : colors.primary;

  return (
    <View className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: colors.muted }}>
      <Animated.View
        style={[{ height: '100%', borderRadius: 999, backgroundColor: barColor }, barStyle]}
      />
    </View>
  );
}

function UsageCard({
  icon,
  title,
  description,
  used,
  limit,
  resetsOn,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  description: string;
  used: number;
  limit: number;
  resetsOn: string;
}) {
  const { t } = useTranslation();
  const pct = limit > 0 ? Math.min(used / limit, 1) : 0;
  const atLimit = pct >= 1;

  return (
    <View
      className="rounded-3xl p-5 mb-4"
      style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.glass.border }}
    >
      <View className="flex-row items-center gap-3 mb-4">
        <View
          className="w-10 h-10 rounded-xl items-center justify-center"
          style={{
            backgroundColor: atLimit ? `${colors.destructive}20` : `${colors.primary}20`,
            borderWidth: 1,
            borderColor: atLimit ? `${colors.destructive}40` : `${colors.primary}40`,
          }}
        >
          <Ionicons
            name={icon}
            size={20}
            color={atLimit ? colors.destructive : colors.primary}
          />
        </View>
        <View className="flex-1">
          <Text className="text-[15px] font-semibold text-foreground">{title}</Text>
          <Text className="text-[12px] text-muted-foreground mt-0.5">{description}</Text>
        </View>
        <Text
          className="text-[13px] font-bold"
          style={{ color: atLimit ? colors.destructive : colors.foreground }}
        >
          {t('limits.used', { used, limit })}
        </Text>
      </View>

      <UsageBar used={used} limit={limit} />

      <Text className="text-[11px] text-muted-foreground mt-2">{resetsOn}</Text>
    </View>
  );
}

export function LimitsScreen() {
  const { t, i18n } = useTranslation();
  const { data, isLoading } = useAiUsage();

  const resetsDate = data
    ? new Date(data.resetsAt).toLocaleDateString(i18n.language === 'ru' ? 'ru-RU' : 'en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  const resetsLabel = t('limits.resetsOn', { date: resetsDate });

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-5 py-5">
          <SettingsHeader title={t('limits.title')} description={t('limits.subtitle')} />

          {isLoading ? (
            <View className="items-center py-12">
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : data ? (
            <>
              <UsageCard
                icon="sparkles-outline"
                title={t('limits.aiTransactions')}
                description={t('limits.aiTransactionsDesc')}
                used={data.transactions.used}
                limit={data.transactions.limit}
                resetsOn={resetsLabel}
              />
              <UsageCard
                icon="bulb-outline"
                title={t('limits.aiInsights')}
                description={t('limits.aiInsightsDesc')}
                used={data.insights.used}
                limit={data.insights.limit}
                resetsOn={resetsLabel}
              />

              <View
                className="rounded-3xl p-5 flex-row items-center gap-3"
                style={{ backgroundColor: `${colors.primary}15`, borderWidth: 1, borderColor: `${colors.primary}30` }}
              >
                <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
                <View className="flex-1">
                  <Text className="text-[13px] font-semibold text-foreground mb-0.5">
                    {t('limits.freePlan')}
                  </Text>
                  <Text className="text-[12px] text-muted-foreground">{t('limits.freePlanDesc')}</Text>
                </View>
              </View>
            </>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
