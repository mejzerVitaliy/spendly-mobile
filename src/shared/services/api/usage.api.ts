import { apiClient } from './api';

export interface AiUsageData {
  month: string;
  resetsAt: string;
  transactions: { used: number; limit: number };
  insights: { used: number; limit: number };
}

export const usageApi = {
  getCurrent: async (): Promise<AiUsageData> => {
    const { data } = await apiClient.get<{ message: string; data: AiUsageData }>('/usage/current');
    return data.data;
  },
};
