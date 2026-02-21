import { BalanceView } from '@/features/balance-view';
import { PeriodSelector } from '@/features/period-selector';
import { CashFlowChart, CategoryBreakdownChart, IncomeExpenseRatioChart } from '@/features/charts';
import { useAnalyticsStore } from '@/shared/stores';
import { useReports } from '@/shared/hooks';
import { TransactionType } from '@/shared/constants';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="bg-card rounded-2xl p-4 mb-4">
      <Text className="text-base font-semibold text-foreground mb-4">{title}</Text>
      {children}
    </View>
  );
}

export const AnalyticsScreen = () => {
  const { startDate, endDate, selectedCategoryTransactionType, setSelectedCategoryTransactionType } = useAnalyticsStore();

  const { getSummary, getCategoryChart, getCashFlowTrend } = useReports({
    startDate,
    endDate,
    type: selectedCategoryTransactionType,
  });

  const summary = getSummary.data?.data;
  const categoryData = getCategoryChart.data?.data;
  const trendData = getCashFlowTrend.data?.data;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-5 py-4">
          <Text className="text-3xl font-bold text-foreground mb-6">Analytics</Text>

          <PeriodSelector />

          <BalanceView startDate={startDate} endDate={endDate} />

          <View className="h-4" />

          <ChartCard title="Cash Flow Trend">
            {getCashFlowTrend.isLoading ? (
              <View className="h-40 items-center justify-center">
                <ActivityIndicator color="#8B5CF6" />
              </View>
            ) : trendData ? (
              <CashFlowChart
                incomes={trendData.incomes}
                expenses={trendData.expenses}
                currencyCode={trendData.currencyCode}
              />
            ) : (
              <View className="h-40 items-center justify-center">
                <Text className="text-muted-foreground text-sm">No data for this period</Text>
              </View>
            )}
          </ChartCard>

          <ChartCard title="Income vs Expense">
            {getSummary.isLoading ? (
              <View className="h-16 items-center justify-center">
                <ActivityIndicator color="#8B5CF6" />
              </View>
            ) : summary ? (
              <IncomeExpenseRatioChart
                totalIncome={summary.totalIncome}
                totalExpense={summary.totalExpense}
                currencyCode={summary.currencyCode}
              />
            ) : (
              <View className="h-16 items-center justify-center">
                <Text className="text-muted-foreground text-sm">No data for this period</Text>
              </View>
            )}
          </ChartCard>

          <View className="bg-card rounded-2xl p-4 mb-4">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-base font-semibold text-foreground">
                {selectedCategoryTransactionType === TransactionType.EXPENSE ? 'Expenses' : 'Income'} by Category
              </Text>
              <View className="flex-row bg-background rounded-lg overflow-hidden">
                <Pressable
                  onPress={() => setSelectedCategoryTransactionType(TransactionType.EXPENSE)}
                  className={`px-3 py-1.5 ${selectedCategoryTransactionType === TransactionType.EXPENSE ? 'bg-primary' : ''}`}
                >
                  <Text className={`text-xs font-medium ${selectedCategoryTransactionType === TransactionType.EXPENSE ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
                    Expense
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setSelectedCategoryTransactionType(TransactionType.INCOME)}
                  className={`px-3 py-1.5 ${selectedCategoryTransactionType === TransactionType.INCOME ? 'bg-primary' : ''}`}
                >
                  <Text className={`text-xs font-medium ${selectedCategoryTransactionType === TransactionType.INCOME ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
                    Income
                  </Text>
                </Pressable>
              </View>
            </View>

            {getCategoryChart.isLoading ? (
              <View className="h-32 items-center justify-center">
                <ActivityIndicator color="#8B5CF6" />
              </View>
            ) : categoryData ? (
              <CategoryBreakdownChart
                data={categoryData.data}
                total={categoryData.total}
                currencyCode={categoryData.currencyCode}
              />
            ) : (
              <View className="h-32 items-center justify-center">
                <Text className="text-muted-foreground text-sm">No data for this period</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
