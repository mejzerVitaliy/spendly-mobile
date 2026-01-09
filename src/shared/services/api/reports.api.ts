import { ReportsBalanceTrendChartRequest, ReportsBalanceTrendChartResponse, ReportsCategoryBarChartRequest, ReportsCategoryBarChartResponse, ReportsCategoryPieChartRequest, ReportsCategoryPieChartResponse, ReportsIncomesExpensesTrendChartRequest, ReportsIncomesExpensesTrendChartResponse, ReportsSummaryRequest, ReportsSummaryResponse } from '@/shared/types';
import { apiClient } from './api';

export const reportsApi = {
  getSummary: async (params?: ReportsSummaryRequest) => {
    const { data } = await apiClient.get<ReportsSummaryResponse>('/reports/summary', { params });

    return data;
  },

  getCategoryBarChart: async (params?: ReportsCategoryBarChartRequest) => {
    const { data } = await apiClient.get<ReportsCategoryBarChartResponse>('/reports/categories/bar-chart', { params });

    return data;
  },

  getCategoryPieChart: async (params?: ReportsCategoryPieChartRequest) => {
    const { data } = await apiClient.get<ReportsCategoryPieChartResponse>('/reports/categories/pie-chart', { params });

    return data;
  },

  getIncomesExpensesTrendChart: async (params?: ReportsIncomesExpensesTrendChartRequest) => {
    const { data } = await apiClient.get<ReportsIncomesExpensesTrendChartResponse>('/reports/incomes-expenses-trend', { params });

    return data;
  },

  getBalanceTrendChart: async (params?: ReportsBalanceTrendChartRequest) => {
    const { data } = await apiClient.get<ReportsBalanceTrendChartResponse>('/reports/balance-trend', { params });

    return data;
  },
};
