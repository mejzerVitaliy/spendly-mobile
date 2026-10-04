import { apiClient } from './api';
import { NotificationType } from '@/shared/stores/notifications';

interface RegisterPushTokenRequest {
  token: string;
  language?: 'en' | 'ru';
}

interface UnregisterPushTokenRequest {
  token: string;
}

export interface ReminderSettings {
  enabled: boolean;
  hourUtc: number | null;
  minuteUtc: number | null;
}

interface UpdateReminderSettingsRequest {
  enabled: boolean;
  hourUtc: number;
  minuteUtc: number;
}

export interface NotificationHistoryItem {
  id: string;
  // Free-text on the server (see notification_logs.type), narrowed here
  // since in practice it only ever holds one of the dispatch service's
  // known literals - same trust boundary as the push `data.type` field
  // notification.service.ts already casts the same way.
  type: NotificationType;
  titleKey: string;
  bodyKey: string;
  bodyParams: Record<string, string | number> | null;
  createdAt: string;
}

const registerPushToken = async (request: RegisterPushTokenRequest) => {
  const { data } = await apiClient.post('/notifications/push-token', request);
  return data;
};

const unregisterPushToken = async (request: UnregisterPushTokenRequest) => {
  const { data } = await apiClient.delete('/notifications/push-token', { data: request });
  return data;
};

const getReminderSettings = async (): Promise<{ message: string; data: ReminderSettings }> => {
  const { data } = await apiClient.get('/notifications/reminder-settings');
  return data;
};

const updateReminderSettings = async (
  request: UpdateReminderSettingsRequest,
): Promise<{ message: string; data: ReminderSettings }> => {
  const { data } = await apiClient.put('/notifications/reminder-settings', request);
  return data;
};

const getHistory = async (): Promise<{ message: string; data: NotificationHistoryItem[] }> => {
  const { data } = await apiClient.get('/notifications/history');
  return data;
};

export const notificationsApi = {
  registerPushToken,
  unregisterPushToken,
  getReminderSettings,
  updateReminderSettings,
  getHistory,
};
