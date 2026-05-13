import { TrendPoint } from '@/shared/types';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Path, Polyline, Text as SvgText } from 'react-native-svg';
import Animated, { useAnimatedProps, useSharedValue, withTiming } from 'react-native-reanimated';
import { colors } from '@/shared/theme';

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface CashFlowChartProps {
  incomes: TrendPoint[];
  expenses: TrendPoint[];
  currencyCode: string;
}

const CHART_HEIGHT = 160;
const PADDING = { top: 16, bottom: 34, left: 24, right: 24 };
const BASE_MIN_POINT_WIDTH = 44;
const TARGET_MAX_LABELS = 26;
const LARGE_RANGE_THRESHOLD = 120;

function resolvePointWidth(count: number): number {
  if (count > 300) return 10;
  if (count > 200) return 12;
  if (count > 120) return 14;
  if (count > 60) return 22;
  return BASE_MIN_POINT_WIDTH;
}

function getChartWidth(count: number, containerWidth: number): number {
  const minPointWidth = resolvePointWidth(count);
  const minWidth = Math.max(0, count - 1) * minPointWidth + PADDING.left + PADDING.right;
  return Math.max(minWidth, containerWidth - 8);
}

function buildPolylinePoints(data: TrendPoint[], chartWidth: number, min: number, max: number): string {
  if (data.length === 0) return '';
  const range = max - min || 1;
  const drawHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom;
  return data
    .map((point, i) => {
      const x = PADDING.left + (i / Math.max(data.length - 1, 1)) * (chartWidth - PADDING.left - PADDING.right);
      // value=min → bottom, value=max → top
      const y = PADDING.top + (1 - (point.value - min) / range) * drawHeight;
      return `${x},${y}`;
    })
    .join(' ');
}

function buildAreaPath(data: TrendPoint[], chartWidth: number, min: number, max: number): string {
  if (data.length === 0) return '';
  const range = max - min || 1;
  const drawHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom;
  const bottomY = PADDING.top + drawHeight;

  const points = data.map((point, i) => {
    const x = PADDING.left + (i / Math.max(data.length - 1, 1)) * (chartWidth - PADDING.left - PADDING.right);
    const y = PADDING.top + (1 - (point.value - min) / range) * drawHeight;
    return { x, y };
  });

  const firstX = points[0].x;
  const lastX = points[points.length - 1].x;
  return `M ${firstX} ${bottomY} ${points.map(p => `L ${p.x} ${p.y}`).join(' ')} L ${lastX} ${bottomY} Z`;
}

export function CashFlowChart({ incomes, expenses, currencyCode }: CashFlowChartProps) {
  const scrollRef = useRef<ScrollView>(null);
  const progress = useSharedValue(0);
  const [containerWidth, setContainerWidth] = useState(300);
  const timeline = useMemo(() => (incomes.length > 0 ? incomes : expenses), [incomes, expenses]);
  const count = timeline.length;
  const isLargeRange = count > LARGE_RANGE_THRESHOLD;

  const chartWidth = useMemo(() => getChartWidth(count, containerWidth), [count, containerWidth]);

  const { min, max } = useMemo(() => {
    const allValues = [...incomes.map((p) => p.value), ...expenses.map((p) => p.value)];
    return {
      min: 0,
      max: Math.max(...allValues, 1),
    };
  }, [incomes, expenses]);

  const incomePoints = useMemo(
    () => buildPolylinePoints(incomes, chartWidth, min, max),
    [incomes, chartWidth, min, max],
  );
  const expensePoints = useMemo(
    () => buildPolylinePoints(expenses, chartWidth, min, max),
    [expenses, chartWidth, min, max],
  );
  const incomeArea = useMemo(
    () => (isLargeRange ? '' : buildAreaPath(incomes, chartWidth, min, max)),
    [isLargeRange, incomes, chartWidth, min, max],
  );
  const expenseArea = useMemo(
    () => (isLargeRange ? '' : buildAreaPath(expenses, chartWidth, min, max)),
    [isLargeRange, expenses, chartWidth, min, max],
  );

  const labelIndexes = useMemo(() => {
    if (count <= 0) return [] as number[];

    const step = count <= TARGET_MAX_LABELS ? 1 : Math.ceil(count / TARGET_MAX_LABELS);
    const indexes: number[] = [];

    for (let i = 0; i < count; i += step) indexes.push(i);
    if (indexes[indexes.length - 1] !== count - 1) indexes.push(count - 1);
    if (indexes[0] !== 0) indexes.unshift(0);

    return indexes;
  }, [count]);

  useEffect(() => {
    if (isLargeRange) {
      progress.value = 1;
      return;
    }

    progress.value = 0;
    progress.value = withTiming(1, { duration: 700 });
  }, [incomes, expenses, isLargeRange, progress]);

  const animatedIncomeProps = useAnimatedProps(() => ({
    d: incomeArea,
    opacity: progress.value,
  }));

  const animatedExpenseProps = useAnimatedProps(() => ({
    d: expenseArea,
    opacity: progress.value,
  }));

  return (
    <View onLayout={e => setContainerWidth(e.nativeEvent.layout.width)}>
      <View style={styles.chartContainer}>
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          contentContainerStyle={{ paddingHorizontal: 4 }}
        >
          <Svg width={chartWidth} height={CHART_HEIGHT}>
            <Polyline
              points={`${PADDING.left},${CHART_HEIGHT - PADDING.bottom} ${chartWidth - PADDING.right},${CHART_HEIGHT - PADDING.bottom}`}
              stroke="rgba(148,163,184,0.25)"
              strokeWidth={1}
            />

            {!isLargeRange && <AnimatedPath animatedProps={animatedExpenseProps} fill="rgba(239,68,68,0.10)" />}
            {!isLargeRange && <AnimatedPath animatedProps={animatedIncomeProps} fill="rgba(16,185,129,0.10)" />}

            {expensePoints ? (
              <Polyline
                points={expensePoints}
                fill="none"
                stroke="#EF4444"
                strokeWidth={2.25}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            ) : null}
            {incomePoints ? (
              <Polyline
                points={incomePoints}
                fill="none"
                stroke="#10B981"
                strokeWidth={2.25}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            ) : null}

            {labelIndexes.map((idx) => {
              const point = timeline[idx];
              const x = PADDING.left + (idx / Math.max(count - 1, 1)) * (chartWidth - PADDING.left - PADDING.right);
              const textAnchor = idx === 0 ? 'start' : idx === count - 1 ? 'end' : 'middle';

              return (
                <SvgText
                  key={`${point.date}-${idx}`}
                  x={x}
                  y={CHART_HEIGHT - 10}
                  fontSize={9}
                  fill={colors.mutedForeground}
                  textAnchor={textAnchor}
                >
                  {point.label}
                </SvgText>
              );
            })}
          </Svg>
        </ScrollView>
      </View>

      <View className="flex-row items-center gap-4 mt-2">
        <View className="flex-row items-center gap-1.5">
          <View className="w-3 h-0.5 bg-emerald-500 rounded" />
          <Text className="text-xs text-muted-foreground">Income</Text>
        </View>
        <View className="flex-row items-center gap-1.5">
          <View className="w-3 h-0.5 bg-red-500 rounded" />
          <Text className="text-xs text-muted-foreground">Expense</Text>
        </View>
        <Text className="text-xs text-muted-foreground ml-auto">{currencyCode}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chartContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
});

