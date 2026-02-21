import { TrendPoint } from '@/shared/types';
import { useEffect, useRef, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import Svg, { Path, Polyline, Text as SvgText } from 'react-native-svg';
import Animated, { useAnimatedProps, useSharedValue, withTiming } from 'react-native-reanimated';

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface CashFlowChartProps {
  incomes: TrendPoint[];
  expenses: TrendPoint[];
  currencyCode: string;
}

const CHART_HEIGHT = 160;
const PADDING = { top: 16, bottom: 28, left: 4, right: 4 };
const MIN_POINT_WIDTH = 28;
const VISIBLE_POINTS = 10;

function getChartWidth(count: number, containerWidth: number): number {
  const minWidth = count * MIN_POINT_WIDTH;
  return Math.max(minWidth, containerWidth);
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

  useEffect(() => {
    progress.value = 0;
    progress.value = withTiming(1, { duration: 900 });
    // scroll to end to show latest data
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: false }), 50);
  }, [incomes, expenses]);

  const count = incomes.length;
  const chartWidth = getChartWidth(count, containerWidth);

  const allValues = [...incomes.map(p => p.value), ...expenses.map(p => p.value)];
  const max = Math.max(...allValues, 1);
  // always start from 0 so zero values appear at bottom
  const min = 0;

  const incomePoints = buildPolylinePoints(incomes, chartWidth, min, max);
  const expensePoints = buildPolylinePoints(expenses, chartWidth, min, max);
  const incomeArea = buildAreaPath(incomes, chartWidth, min, max);
  const expenseArea = buildAreaPath(expenses, chartWidth, min, max);

  const animatedIncomeProps = useAnimatedProps(() => ({
    d: incomeArea,
    opacity: progress.value,
  }));

  const animatedExpenseProps = useAnimatedProps(() => ({
    d: expenseArea,
    opacity: progress.value,
  }));

  const labelStep = Math.max(1, Math.floor(count / VISIBLE_POINTS));
  const labels = incomes.filter((_, i) => i % labelStep === 0 || i === count - 1);

  return (
    <View onLayout={e => setContainerWidth(e.nativeEvent.layout.width)}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
      >
        <Svg width={chartWidth} height={CHART_HEIGHT}>
          <AnimatedPath animatedProps={animatedExpenseProps} fill="rgba(239,68,68,0.08)" />
          <AnimatedPath animatedProps={animatedIncomeProps} fill="rgba(16,185,129,0.08)" />

          {expensePoints ? (
            <Polyline
              points={expensePoints}
              fill="none"
              stroke="#EF4444"
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          ) : null}
          {incomePoints ? (
            <Polyline
              points={incomePoints}
              fill="none"
              stroke="#10B981"
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          ) : null}

          {labels.map((point, i) => {
            const idx = incomes.indexOf(point);
            const x = PADDING.left + (idx / Math.max(count - 1, 1)) * (chartWidth - PADDING.left - PADDING.right);
            return (
              <SvgText
                key={i}
                x={x}
                y={CHART_HEIGHT - 4}
                fontSize={9}
                fill="#6B7280"
                textAnchor="middle"
              >
                {point.label}
              </SvgText>
            );
          })}
        </Svg>
      </ScrollView>

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

