import { useAnalyticsStore, useHomeStore } from '@/shared/stores';
import { formatPeriodLabel, getDateRangeForPeriod, navigatePeriod } from '@/shared/utils';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { LayoutChangeEvent, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { colors } from '@/shared/theme';
import { useTranslation } from 'react-i18next';

interface PeriodSelectorProps {
  store?: 'analytics' | 'home';
}

type PeriodKey = 'week' | 'month' | 'year';

function PeriodTab({ label, isActive, onPress }: { label: string; isActive: boolean; onPress: () => void }) {
  const opacity = useSharedValue(isActive ? 1 : 0.45);

  useEffect(() => {
    opacity.value = withTiming(isActive ? 1 : 0.45, { duration: 180 });
  }, [isActive, opacity]);

  const labelStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Pressable style={{ flex: 1, paddingVertical: 10, alignItems: 'center' }} onPress={onPress}>
      <Animated.Text
        style={[
          styles.periodLabel,
          { color: isActive ? colors.foreground : colors.mutedForeground },
          labelStyle,
        ]}
      >
        {label}
      </Animated.Text>
    </Pressable>
  );
}

export const PeriodSelector = ({ store = 'analytics' }: PeriodSelectorProps) => {
  const indicatorInset = 3;
  const analyticsStore = useAnalyticsStore();
  const homeStore = useHomeStore();
  const { t } = useTranslation();

  const PERIODS = [
    { key: 'week' as PeriodKey, label: t('period.week') },
    { key: 'month' as PeriodKey, label: t('period.month') },
    { key: 'year' as PeriodKey, label: t('period.year') },
  ];

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
    indicatorX.value = withSpring(idx * segmentWidth, { damping: 20, stiffness: 200 });
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
    <View style={styles.wrapper}>
      <View style={styles.navRow}>
        <Pressable
          onPress={() => handleNavigate('prev')}
          hitSlop={8}
          className='w-10 h-10 rounded-xl border border-border items-center justify-center pressed:opacity-60'
        >
          {Platform.OS === 'ios' ? (
            <>
              <View style={[StyleSheet.absoluteFillObject, { backgroundColor: colors.glass.background, borderRadius: 12 }]} />
              <Ionicons name="chevron-back" size={20} color={colors.mutedForeground} />
            </>
          ) : (
            <>
              <View style={[StyleSheet.absoluteFillObject, { backgroundColor: colors.secondary, borderRadius: 12 }]} />
              <Ionicons name="chevron-back" size={20} color={colors.mutedForeground} />
            </>
          )}
        </Pressable>

        <Text style={styles.periodTitle}>{formatPeriodLabel(currentDate, periodType)}</Text>

        <Pressable
          onPress={() => handleNavigate('next')}
          hitSlop={8}
          className='w-10 h-10 rounded-xl border border-border items-center justify-center pressed:opacity-60'
        >
          {Platform.OS === 'ios' ? (
            <>
              <View style={[StyleSheet.absoluteFillObject, { backgroundColor: colors.glass.background, borderRadius: 12 }]} />
              <Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} />
            </>
          ) : (
            <>
              <View style={[StyleSheet.absoluteFillObject, { backgroundColor: colors.secondary, borderRadius: 12 }]} />
              <Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} />
            </>
          )}
        </Pressable>
      </View>

      <View
        style={styles.tabsContainer}
        onLayout={(e: LayoutChangeEvent) => setContainerWidth(e.nativeEvent.layout.width)}
      >
        {Platform.OS === 'ios' && (
          <BlurView intensity={30} tint="systemUltraThinMaterialDark" style={StyleSheet.absoluteFillObject} />
        )}
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: colors.muted, borderRadius: 18 }]} />
        <Animated.View style={[styles.indicator, indicatorStyle]} />
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

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  navBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  periodTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.foreground,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderRadius: 18,
    padding: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    borderRadius: 14,
    backgroundColor: colors.glass.backgroundStrong,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  periodLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
});
