import { apiClient } from './api';

export interface AiInsightItem {
  icon: string;
  title: string;
  content: string;
  type: 'overview' | 'pattern' | 'recommendation';
}

export interface AiInsightsResponse {
  message: string;
  data: {
    insights: AiInsightItem[];
    generatedAt: string;
  };
}

export const insightsApi = {
  getAiInsights: async (params: {
    startDate?: string;
    endDate?: string;
    language?: string;
  }) => {
    const { data } = await apiClient.get<AiInsightsResponse>('/reports/ai-insights', { params });
    return data;
  },
};
