import { useEffect, useState } from 'react';
import { LayoutChangeEvent, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

interface RatioChartProps {
  totalIncome: number;
  totalExpense: number;
  currencyCode: string;
}

function formatAmount(amount: number): string {
  const value = amount / 100;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return value.toFixed(0);
}

export function IncomeExpenseRatioChart({ totalIncome, totalExpense, currencyCode }: RatioChartProps) {
  const [barWidth, setBarWidth] = useState(0);
  const total = totalIncome + totalExpense;
  const incomeRatio = total > 0 ? totalIncome / total : 0.5;

  const incomeAnim = useSharedValue(0);

  useEffect(() => {
    incomeAnim.value = 0;
    incomeAnim.value = withTiming(incomeRatio, { duration: 700 });
  }, [totalIncome, totalExpense]);

  const incomeStyle = useAnimatedStyle(() => ({
    width: incomeAnim.value * barWidth,
  }));

  const expenseStyle = useAnimatedStyle(() => ({
    width: (1 - incomeAnim.value) * barWidth,
  }));

  const incomePercent = Math.round(incomeRatio * 100);
  const expensePercent = 100 - incomePercent;

  const onLayout = (e: LayoutChangeEvent) => setBarWidth(e.nativeEvent.layout.width);

  return (
    <View>
      <View
        className="flex-row h-8 rounded-full overflow-hidden"
        style={{ gap: 2 }}
        onLayout={onLayout}
      >
        <Animated.View
          className="bg-emerald-500 items-center justify-center overflow-hidden"
          style={[incomeStyle, { borderRadius: 999 }]}
        >
          {incomePercent > 15 && (
            <Text className="text-white text-xs font-semibold" numberOfLines={1}>
              {incomePercent}%
            </Text>
          )}
        </Animated.View>
        <Animated.View
          className="bg-red-500 items-center justify-center overflow-hidden"
          style={[expenseStyle, { borderRadius: 999 }]}
        >
          {expensePercent > 15 && (
            <Text className="text-white text-xs font-semibold" numberOfLines={1}>
              {expensePercent}%
            </Text>
          )}
        </Animated.View>
      </View>

      <View className="flex-row justify-between mt-3">
        <View className="flex-row items-center gap-2">
          <View className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <View>
            <Text className="text-xs text-muted-foreground">Income</Text>
            <Text className="text-sm font-semibold text-foreground">
              {currencyCode} {formatAmount(totalIncome)}
            </Text>
          </View>
        </View>
        <View className="flex-row items-center gap-2">
          <View>
            <Text className="text-xs text-muted-foreground text-right">Expense</Text>
            <Text className="text-sm font-semibold text-foreground text-right">
              {currencyCode} {formatAmount(totalExpense)}
            </Text>
          </View>
          <View className="w-2.5 h-2.5 rounded-full bg-red-500" />
        </View>
      </View>
    </View>
  );
}
