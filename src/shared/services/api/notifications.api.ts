import { apiClient } from './api';

interface RegisterPushTokenRequest {
  token: string;
  language?: 'en' | 'ru';
}

interface UnregisterPushTokenRequest {
  token: string;
}

const registerPushToken = async (request: RegisterPushTokenRequest) => {
  const { data } = await apiClient.post('/notifications/push-token', request);
  return data;
};

const unregisterPushToken = async (request: UnregisterPushTokenRequest) => {
  const { data } = await apiClient.delete('/notifications/push-token', { data: request });
  return data;
};

export const notificationsApi = {
  registerPushToken,
  unregisterPushToken,
};
