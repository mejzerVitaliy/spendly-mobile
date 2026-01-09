import { BalanceTrend } from '@/features/balance-trend';
import { BalanceView } from '@/features/balance-view';
import { CategoryChart } from '@/features/category-chart';
import { IncomeExpenseTrend } from '@/features/income-expense-trend';
import { PeriodSelector } from '@/features/period-selector';
import { useAnalyticsStore } from '@/shared/stores';
import { Separator } from '@/shared/ui';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const AnalyticsScreen = () => {
  const { startDate, endDate } = useAnalyticsStore();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1">
        <View className="flex-1 px-5 py-4">
          <Text className="text-3xl font-bold text-foreground mb-6">Analytics</Text>
          
          <PeriodSelector />

          <View className="flex flex-col">
            <BalanceView startDate={startDate} endDate={endDate} />

            <Separator />

            <CategoryChart startDate={startDate} endDate={endDate} />

            <Separator />

            <IncomeExpenseTrend startDate={startDate} endDate={endDate} />

            <Separator />

            <BalanceTrend startDate={startDate} endDate={endDate} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
