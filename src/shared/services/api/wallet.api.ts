import {
  CreateWalletRequest,
  CreateWalletResponse,
  GetAllWalletsResponse,
  GetTotalBalanceResponse,
  GetWalletByIdResponse,
  SetDefaultWalletRequest,
  UpdateWalletRequest,
  UpdateWalletResponse,
} from '@/shared/types';
import { apiClient } from './api';

export const walletApi = {
  getAll: async (includeArchived = false): Promise<GetAllWalletsResponse> => {
    const response = await apiClient.get<GetAllWalletsResponse>(
      `/wallet?includeArchived=${includeArchived}`
    );
    return response.data;
  },

  getById: async (id: string): Promise<GetWalletByIdResponse> => {
    const response = await apiClient.get<GetWalletByIdResponse>(`/wallet/${id}`);
    return response.data;
  },

  getDefault: async (): Promise<GetWalletByIdResponse> => {
    const response = await apiClient.get<GetWalletByIdResponse>('/wallet/default');
    return response.data;
  },

  getTotalBalance: async (): Promise<GetTotalBalanceResponse> => {
    const response = await apiClient.get<GetTotalBalanceResponse>('/wallet/total-balance');
    return response.data;
  },

  create: async (data: CreateWalletRequest): Promise<CreateWalletResponse> => {
    const response = await apiClient.post<CreateWalletResponse>('/wallet', data);
    return response.data;
  },

  update: async (id: string, data: UpdateWalletRequest): Promise<UpdateWalletResponse> => {
    const response = await apiClient.put<UpdateWalletResponse>(`/wallet/${id}`, data);
    return response.data;
  },

  archive: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>(`/wallet/${id}/archive`);
    return response.data;
  },

  unarchive: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>(`/wallet/${id}/unarchive`);
    return response.data;
  },

  setDefault: async (data: SetDefaultWalletRequest): Promise<UpdateWalletResponse> => {
    const response = await apiClient.post<UpdateWalletResponse>('/wallet/set-default', data);
    return response.data;
  },
};
