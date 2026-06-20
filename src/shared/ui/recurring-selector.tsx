import { RecurringPeriod, RECURRING_PERIODS } from '@/shared/types/transactions/transactions';
import { colors } from '@/shared/theme';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Platform, Pressable, ScrollView, Switch, Text, View } from 'react-native';

interface RecurringSelectorProps {
  enabled: boolean;
  period: RecurringPeriod | null;
  onToggle: (v: boolean) => void;
  onPeriodChange: (p: RecurringPeriod) => void;
}

export function RecurringSelector({ enabled, period, onToggle, onPeriodChange }: RecurringSelectorProps) {
  const { t } = useTranslation();

  return (
    <View className="mb-3">
      {/* Toggle row */}
      <View
        className="flex-row items-center justify-between px-4 rounded-2xl bg-input border border-border"
        style={{ paddingVertical: Platform.OS === 'android' ? 2 : 10 }}
      >
        <View className="flex-row items-center gap-2.5">
          <Ionicons name="repeat-outline" size={18} color={colors.primary} />
          <Text className="text-sm font-semibold text-foreground">{t('recurring.repeat')}</Text>
        </View>
        <Switch
          value={enabled}
          onValueChange={onToggle}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor="#fff"
          style={Platform.OS === 'android' ? { transform: [{ scale: 0.85 }] } : undefined}
        />
      </View>

      {/* Period chips */}
      {enabled && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-2"
          contentContainerStyle={{ paddingHorizontal: 2, gap: 8 }}
        >
          {RECURRING_PERIODS.map((p) => {
            const selected = period === p;
            return (
              <Pressable
                key={p}
                onPress={() => onPeriodChange(p)}
                className={`px-4 py-2 rounded-full border active:opacity-70 ${
                  selected
                    ? 'bg-primary border-primary'
                    : 'bg-input border-border'
                }`}
              >
                <Text className={`text-xs font-semibold ${selected ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
                  {t(`recurring.${p}`)}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}
