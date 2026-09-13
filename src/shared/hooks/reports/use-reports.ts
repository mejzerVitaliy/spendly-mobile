import { reportsApi } from '@/shared/services/api';
import { useQuery } from '@tanstack/react-query';
import { TransactionType } from '@/shared/constants';

interface UseReportsParams {
  startDate?: string;
  endDate?: string;
  type?: TransactionType;
  language?: string;
  walletId?: string;
  enabled?: boolean;
}

export const useReports = (params?: UseReportsParams) => {
  const getSummaryQuery = useQuery({
    queryKey: ['reports', 'summary', params?.startDate, params?.endDate, params?.walletId],
    queryFn: () => reportsApi.getSummary({ startDate: params?.startDate, endDate: params?.endDate, walletId: params?.walletId }),
    enabled: params?.enabled ?? true,
    staleTime: 30 * 1000,
  });

  const getCategoryChartQuery = useQuery({
    queryKey: ['reports', 'categories', params?.startDate, params?.endDate, params?.type, params?.language, params?.walletId],
    queryFn: () => reportsApi.getCategoryChart(params),
    enabled: !!params?.startDate && !!params?.endDate,
    staleTime: 30 * 1000,
  });

  const getCashFlowTrendQuery = useQuery({
    queryKey: ['reports', 'cashFlowTrend', params?.startDate, params?.endDate, params?.walletId],
    queryFn: () => reportsApi.getCashFlowTrend({ startDate: params?.startDate, endDate: params?.endDate, walletId: params?.walletId }),
    enabled: !!params?.startDate && !!params?.endDate,
    staleTime: 5 * 60 * 1000,
  });

  return {
    getSummary: getSummaryQuery,
    getCategoryChart: getCategoryChartQuery,
    getCashFlowTrend: getCashFlowTrendQuery,
  };
};
