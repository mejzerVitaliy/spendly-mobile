import {
  UpdateSettingsRequest,
  UpdateSettingsResponse,
  UpdateEmailRequest,
  UpdateEmailResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
  DeleteAccountResponse,
} from '@/shared/types';
import { apiClient } from './api';

const updateSettings = async (request: UpdateSettingsRequest): Promise<UpdateSettingsResponse> => {
  const { data } = await apiClient.put<UpdateSettingsResponse>('/profile/update-settings', request);
  return data;
};

const updateEmail = async (request: UpdateEmailRequest): Promise<UpdateEmailResponse> => {
  const { data } = await apiClient.put<UpdateEmailResponse>('/profile/update-email', request);
  return data;
};

const changePassword = async (request: ChangePasswordRequest): Promise<ChangePasswordResponse> => {
  const { data } = await apiClient.put<ChangePasswordResponse>('/profile/change-password', request);
  return data;
};

const deleteAccount = async (): Promise<DeleteAccountResponse> => {
  const { data } = await apiClient.delete<DeleteAccountResponse>('/profile');
  return data;
};

export const profileApi = {
  updateSettings,
  updateEmail,
  changePassword,
  deleteAccount,
};
