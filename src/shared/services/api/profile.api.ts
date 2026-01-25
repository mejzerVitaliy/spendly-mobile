import { UpdateSettingsRequest, UpdateSettingsResponse } from '@/shared/types';
import { apiClient } from './api';

const updateSettings = async (
  request: UpdateSettingsRequest,
): Promise<UpdateSettingsResponse> => {
  const { data } = await apiClient.put<UpdateSettingsResponse>(
    '/profile/update-settings',
    request,
  );
  return data;
};

export const profileApi = {
  updateSettings,
};
