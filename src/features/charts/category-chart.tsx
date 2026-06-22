import { formatCompact } from '@/shared/utils';
import { CategoryChartItem } from '@/shared/types';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';

interface CategoryChartProps {
  data: CategoryChartItem[];
  total: number;
  currencyCode: string;
}

function BarItem({ item, index, maxAmount }: { item: CategoryChartItem; index: number; maxAmount: number }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = 0;
    progress.value = withDelay(index * 80, withTiming(item.value / maxAmount, { duration: 600 }));
  }, [item.value, maxAmount, index, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return (
    <View className="mb-3">
      <View className="flex-row items-center justify-between mb-1">
        <View className="flex-row items-center gap-2 flex-1 mr-2">
          <View className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
          <Text className="text-sm text-foreground flex-1" numberOfLines={1}>{item.label}</Text>
        </View>
        <View className="flex-row items-center gap-2">
          <Text className="text-xs text-muted-foreground">{item.percentage}%</Text>
        </View>
      </View>
      <View className="h-2 bg-card rounded-full overflow-hidden">
        <Animated.View
          className="h-full rounded-full"
          style={[animatedStyle, { backgroundColor: item.color }]}
        />
      </View>
    </View>
  );
}

const UNKNOWN_LABELS = new Set(['Unknown', 'Неизвестно']);

export function CategoryBreakdownChart({ data, total, currencyCode }: CategoryChartProps) {
  const { t } = useTranslation();

  if (!data || data.length === 0) {
    return (
      <View className="py-8 items-center">
        <Text className="text-muted-foreground text-sm">{t('common.noData')}</Text>
      </View>
    );
  }

  const maxAmount = Math.max(...data.map(d => d.value));
  const normalized = data.map(item =>
    UNKNOWN_LABELS.has(item.label) ? { ...item, label: t('common.transfer') } : item,
  );

  return (
    <View>
      {normalized.map((item, index) => (
        <BarItem key={item.label} item={item} index={index} maxAmount={maxAmount} />
      ))}
      <View className="mt-2 pt-2 border-t border-border flex-row justify-between">
        <Text className="text-xs text-muted-foreground">Total</Text>
        <Text className="text-xs font-semibold text-foreground">
          {currencyCode} {formatCompact(total)}
        </Text>
      </View>
    </View>
  );
}
