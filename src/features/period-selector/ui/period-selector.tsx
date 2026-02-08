import { useAnalyticsStore, useHomeStore } from '@/shared/stores';
import { formatPeriodLabel, getDateRangeForPeriod, navigatePeriod } from '@/shared/utils';
import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';

interface PeriodSelectorProps {
  store?: 'analytics' | 'home';
}

export const PeriodSelector = ({ store = 'analytics' }: PeriodSelectorProps) => {
  const analyticsStore = useAnalyticsStore();
  const homeStore = useHomeStore();
  
  const { periodType, currentDate, setPeriodType, setCurrentDate, setDateRange } = 
    store === 'home' ? homeStore : analyticsStore;

  useEffect(() => {
    const { startDate, endDate } = getDateRangeForPeriod(currentDate, periodType);
    setDateRange(startDate, endDate);
  }, [currentDate, periodType, setDateRange]);

  const handleNavigate = (direction: 'prev' | 'next') => {
    const newDate = navigatePeriod(currentDate, periodType, direction);
    setCurrentDate(newDate);
  };

  return (
    <View className="flex-col items-center gap-2 mb-6">
      {/* Period Navigation */}
      <View className="w-full flex-row items-center justify-between gap-3">
        <Pressable
          onPress={() => handleNavigate('prev')}
          className="w-10 h-10 items-center justify-center rounded-full bg-card active:bg-muted"
        >
          <Text className="text-foreground text-lg">←</Text>
        </Pressable>
        
        <Text className="text-lg font-medium text-foreground text-center">
          {formatPeriodLabel(currentDate, periodType)}
        </Text>
        
        <Pressable
          onPress={() => handleNavigate('next')}
          className="w-10 h-10 items-center justify-center rounded-full bg-card active:bg-muted"
        >
          <Text className="text-foreground text-lg">→</Text>
        </Pressable>
      </View>

      {/* Period Type Selector */}
      <View className="w-full flex-row items-center justify-between gap-2">
        <Pressable
          onPress={() => setPeriodType('week')}
          className={`flex-1 px-3 py-2 rounded-full ${
            periodType === 'week' ? 'bg-primary' : 'bg-card'
          }`}
        >
          <Text
            className={`text-sm text-center font-medium ${
              periodType === 'week' ? 'text-primary-foreground' : 'text-muted-foreground'
            }`}
          >
            Week
          </Text>
        </Pressable>
        
        <Pressable
          onPress={() => setPeriodType('month')}
          className={`flex-1 px-3 py-2 rounded-full ${
            periodType === 'month' ? 'bg-primary' : 'bg-card'
          }`}
        >
          <Text
            className={`text-sm text-center font-medium ${
              periodType === 'month' ? 'text-primary-foreground' : 'text-muted-foreground'
            }`}
          >
            Month
          </Text>
        </Pressable>
        
        <Pressable
          onPress={() => setPeriodType('year')}
          className={`flex-1 px-3 py-2 rounded-full ${
            periodType === 'year' ? 'bg-primary' : 'bg-card'
          }`}
        >
          <Text
            className={`text-sm text-center font-medium ${
              periodType === 'year' ? 'text-primary-foreground' : 'text-muted-foreground'
            }`}
          >
            Year
          </Text>
        </Pressable>
      </View>
    </View>
  );
};
