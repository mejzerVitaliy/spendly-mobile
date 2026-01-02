import { reportsApi } from '@/shared/services/api';
import { useQuery } from '@tanstack/react-query';

interface UseReportsSummaryParams {
  startDate?: string;
  endDate?: string;
}

export const useReportsSummary = (params?: UseReportsSummaryParams) => {
  return useQuery({
    queryKey: ['reports', 'summary', params],
    queryFn: () => reportsApi.getSummary(params),
  });
};
