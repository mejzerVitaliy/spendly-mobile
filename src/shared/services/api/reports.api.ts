import { ReportsCashFlowTrendRequest, ReportsCashFlowTrendResponse, ReportsCategoryChartRequest, ReportsCategoryChartResponse, ReportsSummaryRequest, ReportsSummaryResponse } from '@/shared/types';
import { apiClient } from './api';

export const reportsApi = {
  getSummary: async (params?: ReportsSummaryRequest) => {
    const { data } = await apiClient.get<ReportsSummaryResponse>('/reports/summary', { params });
    return data;
  },

  getCategoryChart: async (params?: ReportsCategoryChartRequest) => {
    const { data } = await apiClient.get<ReportsCategoryChartResponse>('/reports/categories', { params });
    return data;
  },

  getCashFlowTrend: async (params?: ReportsCashFlowTrendRequest) => {
    const { data } = await apiClient.get<ReportsCashFlowTrendResponse>('/reports/cash-flow-trend', { params });
    return data;
  },
};
