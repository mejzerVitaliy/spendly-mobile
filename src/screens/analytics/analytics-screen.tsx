import { BalanceView } from '@/features/balance-view';
import { InsightsSection } from '@/features/insights';
import { PeriodSelector } from '@/features/period-selector';
import { CashFlowChart, CategoryBreakdownChart, IncomeExpenseRatioChart } from '@/features/charts';
import { AppHeader, SegmentedControl } from '@/shared/ui';
import { useAnalyticsStore } from '@/shared/stores';
import { useReports } from '@/shared/hooks';
import { TransactionType } from '@/shared/constants';
import { colors } from '@/shared/theme';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Platform, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

type AnalyticsTab = 'analytics' | 'insights';

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  if (Platform.OS === 'ios') {
    return (
      <View style={styles.chartCard}>
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: colors.glass.background, borderRadius: 22 }]} />
        <View style={[StyleSheet.absoluteFillObject, { borderRadius: 22, borderWidth: 1, borderColor: colors.glass.border }]} />
        <Text style={styles.chartTitle}>{title}</Text>
        <View>{children}</View>
      </View>
    );
  }

  return (
    <View style={[styles.chartCard, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }]}>
      <Text style={styles.chartTitle}>{title}</Text>
      <View>{children}</View>
    </View>
  );
}

export const AnalyticsScreen = () => {
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('analytics');
  const { t, i18n } = useTranslation();

  const { startDate, endDate, selectedCategoryTransactionType, setSelectedCategoryTransactionType } =
    useAnalyticsStore();

  const { getSummary, getCategoryChart, getCashFlowTrend } = useReports({
    startDate,
    endDate,
    type: selectedCategoryTransactionType,
    language: i18n.language,
  });

  const summary = getSummary.data?.data;
  const categoryData = getCategoryChart.data?.data;
  const trendData = getCashFlowTrend.data?.data;

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      queryClient.refetchQueries({ queryKey: ['user'], type: 'all' }),
      queryClient.refetchQueries({ queryKey: ['wallets'], type: 'all' }),
      queryClient.refetchQueries({ queryKey: ['reports'], type: 'all' }),
    ]);
    setRefreshing(false);
  }, [queryClient]);

  const tabOptions = [
    { label: t('analytics.analytics'), value: 'analytics' as AnalyticsTab },
    { label: t('analytics.insights'), value: 'insights' as AnalyticsTab },
  ];

  const categoryTypeOptions = [
    { label: t('analytics.expense'), value: TransactionType.EXPENSE },
    { label: t('analytics.income'), value: TransactionType.INCOME },
  ];

  const categoryChartTitle =
    (selectedCategoryTransactionType === TransactionType.EXPENSE
      ? t('analytics.expenses')
      : t('analytics.income')) +
    ' ' +
    t('analytics.byCategory');

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <AppHeader />
        <View style={styles.content}>
          <SegmentedControl
            value={activeTab}
            options={tabOptions}
            onChange={setActiveTab}
          />

          <View style={{ height: 20 }} />

          <PeriodSelector />

          {activeTab === 'analytics' && (
            <>
              <BalanceView startDate={startDate} endDate={endDate} />

              <View style={{ height: 8 }} />

              <ChartCard title={t('analytics.cashFlowTrend')}>
                {getCashFlowTrend.isLoading ? (
                  <View style={styles.loadingBox}>
                    <ActivityIndicator color={colors.primary} />
                  </View>
                ) : trendData ? (
                  <CashFlowChart
                    incomes={trendData.incomes}
                    expenses={trendData.expenses}
                    currencyCode={trendData.currencyCode}
                  />
                ) : (
                  <View style={styles.loadingBox}>
                    <Text style={styles.emptyText}>{t('common.noData')}</Text>
                  </View>
                )}
              </ChartCard>

              <ChartCard title={t('analytics.incomeVsExpense')}>
                {getSummary.isLoading ? (
                  <View style={[styles.loadingBox, { height: 64 }]}>
                    <ActivityIndicator color={colors.primary} />
                  </View>
                ) : summary ? (
                  <IncomeExpenseRatioChart
                    totalIncome={summary.totalIncome}
                    totalExpense={summary.totalExpense}
                    currencyCode={summary.currencyCode}
                  />
                ) : (
                  <View style={[styles.loadingBox, { height: 64 }]}>
                    <Text style={styles.emptyText}>{t('common.noData')}</Text>
                  </View>
                )}
              </ChartCard>

              {/* Category breakdown */}
              {Platform.OS === 'ios' ? (
                <View style={[styles.chartCard, { paddingBottom: 8 }]}>
                  <View style={[StyleSheet.absoluteFillObject, { backgroundColor: colors.glass.background, borderRadius: 22 }]} />
                  <View style={[StyleSheet.absoluteFillObject, { borderRadius: 22, borderWidth: 1, borderColor: colors.glass.border }]} />
                  <View style={styles.catHeader}>
                    <Text style={styles.chartTitle}>{categoryChartTitle}</Text>
                    <SegmentedControl
                      value={selectedCategoryTransactionType}
                      onChange={setSelectedCategoryTransactionType}
                      options={categoryTypeOptions}
                    />
                  </View>
                  {getCategoryChart.isLoading ? (
                    <View style={styles.loadingBox}>
                      <ActivityIndicator color={colors.primary} />
                    </View>
                  ) : categoryData ? (
                    <CategoryBreakdownChart
                      data={categoryData.data}
                      total={categoryData.total}
                      currencyCode={categoryData.currencyCode}
                    />
                  ) : (
                    <View style={styles.loadingBox}>
                      <Text style={styles.emptyText}>{t('common.noData')}</Text>
                    </View>
                  )}
                </View>
              ) : (
                <View style={[styles.chartCard, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, paddingBottom: 8 }]}>
                  <View style={styles.catHeader}>
                    <Text style={styles.chartTitle}>{categoryChartTitle}</Text>
                    <SegmentedControl
                      value={selectedCategoryTransactionType}
                      onChange={setSelectedCategoryTransactionType}
                      options={categoryTypeOptions}
                    />
                  </View>
                  {getCategoryChart.isLoading ? (
                    <View style={styles.loadingBox}>
                      <ActivityIndicator color={colors.primary} />
                    </View>
                  ) : categoryData ? (
                    <CategoryBreakdownChart
                      data={categoryData.data}
                      total={categoryData.total}
                      currencyCode={categoryData.currencyCode}
                    />
                  ) : (
                    <View style={styles.loadingBox}>
                      <Text style={styles.emptyText}>{t('common.noData')}</Text>
                    </View>
                  )}
                </View>
              )}
            </>
          )}

          {activeTab === 'insights' && (
            <InsightsSection
              startDate={startDate}
              endDate={endDate}
              language={i18n.language}
            />
          )}

          <View style={{ height: 32 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  chartCard: {
    borderRadius: 22,
    overflow: 'hidden',
    padding: 16,
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.foreground,
    marginBottom: 14,
  },
  loadingBox: {
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: colors.mutedForeground,
  },
  catHeader: {
    gap: 12,
    marginBottom: 4,
  },
});
