import { reportsApi } from '@/shared/services/api';
import { useQuery } from '@tanstack/react-query';
import { TransactionType } from '@/shared/constants';

interface UseReportsParams {
  startDate?: string;
  endDate?: string;
  type?: TransactionType;
}

export const useReports = (params?: UseReportsParams) => {
  const getSummaryQuery = useQuery({
    queryKey: ['reports', 'summary', params?.startDate, params?.endDate],
    queryFn: () => reportsApi.getSummary({ startDate: params?.startDate, endDate: params?.endDate }),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  const getCategoryChartQuery = useQuery({
    queryKey: ['reports', 'categories', params?.startDate, params?.endDate, params?.type],
    queryFn: () => reportsApi.getCategoryChart(params),
    enabled: !!params?.startDate && !!params?.endDate,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  const getCashFlowTrendQuery = useQuery({
    queryKey: ['reports', 'cashFlowTrend', params?.startDate, params?.endDate],
    queryFn: () => reportsApi.getCashFlowTrend({ startDate: params?.startDate, endDate: params?.endDate }),
    enabled: !!params?.startDate && !!params?.endDate,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  return {
    getSummary: getSummaryQuery,
    getCategoryChart: getCategoryChartQuery,
    getCashFlowTrend: getCashFlowTrendQuery,
  };
};
