import { ReportsSummaryRequest, ReportsSummaryResponse } from '@/shared/types';
import { apiClient } from './api';

export const reportsApi = {
  getSummary: async (params?: ReportsSummaryRequest) => {
    const { data } = await apiClient.get<ReportsSummaryResponse>('/reports/summary', { params });

    return data;
  },
};
