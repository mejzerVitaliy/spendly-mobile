import { reportsApi } from '@/shared/services/api';
import { useQuery } from '@tanstack/react-query';
import { TransactionType } from '@/shared/constants';

interface UseReportsParams {
  startDate?: string;
  endDate?: string;
  type?: TransactionType
}

export const useReports = (params?: UseReportsParams) => {
  const useReportsSummaryQuery = useQuery({
    queryKey: ['reports', 'summary', params],
    queryFn: () => reportsApi.getSummary(params),
  });

  const getCategoryBarChartQuery = useQuery({
    queryKey: ['reports', 'categoryBarChart', params],
    queryFn: () => reportsApi.getCategoryBarChart(params),
  });

  const getCategoryPieChartQuery = useQuery({
    queryKey: ['reports', 'categoryPieChart', params],
    queryFn: () => reportsApi.getCategoryPieChart(params),
  });

  const getIncomesExpensesTrendChartQuery = useQuery({
    queryKey: ['reports', 'incomesExpensesTrendChart', params?.startDate, params?.endDate],
    queryFn: () => reportsApi.getIncomesExpensesTrendChart({startDate: params?.startDate, endDate: params?.endDate}),
  });

  const getBalanceTrendChartQuery = useQuery({
    queryKey: ['reports', 'balanceTrendChart', params?.startDate, params?.endDate],
    queryFn: () => reportsApi.getBalanceTrendChart({startDate: params?.startDate, endDate: params?.endDate}),
  });

  return {
    getSummary: useReportsSummaryQuery,
    getCategoryBarChart: getCategoryBarChartQuery,
    getCategoryPieChart: getCategoryPieChartQuery,
    getIncomesExpensesTrendChart: getIncomesExpensesTrendChartQuery,
    getBalanceTrendChart: getBalanceTrendChartQuery
  }
};
