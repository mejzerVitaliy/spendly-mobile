import { useAnalyticsStore, useHomeStore } from '@/shared/stores';
import { formatPeriodLabel, getDateRangeForPeriod, navigatePeriod } from '@/shared/utils';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { LayoutChangeEvent, Pressable, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

interface PeriodSelectorProps {
  store?: 'analytics' | 'home';
}

const PERIODS = [
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
  { key: 'year', label: 'Year' },
] as const;

type PeriodKey = (typeof PERIODS)[number]['key'];

interface PeriodTabProps {
  label: string;
  isActive: boolean;
  onPress: () => void;
}

function PeriodTab({ label, isActive, onPress }: PeriodTabProps) {
  const opacity = useSharedValue(isActive ? 1 : 0.5);

  useEffect(() => {
    opacity.value = withTiming(isActive ? 1 : 0.5, { duration: 180 });
  }, [isActive, opacity]);

  const labelStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Pressable
      className="flex-1 py-2 items-center justify-center"
      onPress={onPress}
    >
      <Animated.Text className="text-sm font-semibold text-foreground" style={labelStyle}>
        {label}
      </Animated.Text>
    </Pressable>
  );
}

export const PeriodSelector = ({ store = 'analytics' }: PeriodSelectorProps) => {
  const indicatorInset = 3;
  const analyticsStore = useAnalyticsStore();
  const homeStore = useHomeStore();

  const { periodType, currentDate, setPeriodType, setCurrentDate, setDateRange } =
    store === 'home' ? homeStore : analyticsStore;

  const [containerWidth, setContainerWidth] = useState(0);
  const indicatorX = useSharedValue(0);
  const indicatorWidth = useSharedValue(0);

  useEffect(() => {
    const { startDate, endDate } = getDateRangeForPeriod(currentDate, periodType);
    setDateRange(startDate, endDate);
  }, [currentDate, periodType, setDateRange]);

  useEffect(() => {
    if (containerWidth === 0) return;
    const idx = PERIODS.findIndex((p) => p.key === periodType);
    if (idx === -1) return;

    const segmentWidth = containerWidth / PERIODS.length;
    const x = idx * segmentWidth;

    indicatorX.value = withSpring(x, { damping: 20, stiffness: 200 });
    indicatorWidth.value = withSpring(segmentWidth, { damping: 20, stiffness: 200 });
  }, [periodType, containerWidth, indicatorX, indicatorWidth]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value + indicatorInset }],
    width: Math.max(indicatorWidth.value - indicatorInset * 2, 0),
  }));

  const handleNavigate = (direction: 'prev' | 'next') => {
    setCurrentDate(navigatePeriod(currentDate, periodType, direction));
  };

  return (
    <View className="mb-4">
      <View className="flex-row items-center justify-between mb-3">
        <Pressable
          onPress={() => handleNavigate('prev')}
          hitSlop={8}
          className="w-10 h-10 items-center justify-center rounded-full bg-card active:bg-muted"
        >
          <Ionicons name="chevron-back" size={18} color="#9CA3AF" />
        </Pressable>

        <Text className="text-base font-semibold text-foreground">
          {formatPeriodLabel(currentDate, periodType)}
        </Text>

        <Pressable
          onPress={() => handleNavigate('next')}
          hitSlop={8}
          className="w-10 h-10 items-center justify-center rounded-full bg-card active:bg-muted"
        >
          <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
        </Pressable>
      </View>

      <View
        className="flex-row bg-muted rounded-2xl p-1 relative overflow-hidden"
        onLayout={(e: LayoutChangeEvent) => setContainerWidth(e.nativeEvent.layout.width)}
      >
        <Animated.View
          className="absolute top-1 bottom-1 bg-card rounded-2xl"
          style={indicatorStyle}
        />
        {PERIODS.map((period) => (
          <PeriodTab
            key={period.key}
            label={period.label}
            isActive={periodType === period.key}
            onPress={() => setPeriodType(period.key as PeriodKey)}
          />
        ))}
      </View>
    </View>
  );
};
