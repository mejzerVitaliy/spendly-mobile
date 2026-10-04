import { ENV } from '@/shared/constants/config';
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { tokenStorage } from '../storage';
import { getIsOnline } from '@/shared/lib/network-state';
import Toast from 'react-native-toast-message';
import { Alert, Platform } from 'react-native';
import { router } from 'expo-router';
import i18n from '@/shared/i18n';

let limitAlertVisible = false;

const apiClient = axios.create({
  baseURL: ENV.API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'X-Platform': Platform.OS,
  },
});

let isRefreshing = false;
let failedQueue: {
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}[] = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const method = (config.method ?? 'get').toLowerCase();
    if (method !== 'get' && !getIsOnline()) {
      Toast.show({
        type: 'error',
        text1: i18n.t('offline.actionTitle'),
        text2: i18n.t('offline.actionBody'),
      });
      return Promise.reject(Object.assign(new Error('offline'), { isOffline: true }));
    }

    const token = await tokenStorage.getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 429) {
      // The API returns 429 for two unrelated reasons: the user's actual
      // monthly AI usage quota (LimitReachedError, code LIMIT_REACHED), and
      // Fastify's generic per-IP rate limiter tripping on ordinary traffic
      // bursts (no `code` field). Only the former is something the user can
      // act on - showing "your limits are exhausted" for the latter is just
      // wrong and confusing.
      const isUsageLimit =
        (error.response.data as { code?: string } | undefined)?.code === 'LIMIT_REACHED';

      if (isUsageLimit && !limitAlertVisible) {
        limitAlertVisible = true;
        const resetLimitAlertVisible = () => { limitAlertVisible = false; };
        // Safety net: Alert.alert's onDismiss only fires for Android
        // back-button/outside-tap dismissal, not for every possible way an
        // alert can go away. Without this, one missed dismissal path leaves
        // limitAlertVisible stuck `true` and silently swallows every future
        // 429 alert for the rest of the session.
        const unstickTimer = setTimeout(resetLimitAlertVisible, 60_000);
        const clearAndReset = () => {
          clearTimeout(unstickTimer);
          resetLimitAlertVisible();
        };
        Alert.alert(
          i18n.t('limits.limitReachedTitle'),
          i18n.t('limits.limitReachedBody'),
          [
            {
              text: i18n.t('common.cancel'),
              style: 'cancel',
              onPress: clearAndReset,
            },
            {
              text: i18n.t('limits.viewUsage'),
              onPress: () => {
                clearAndReset();
                router.push('/settings/limits' as any);
              },
            },
          ],
          { onDismiss: clearAndReset },
        );
      }
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url?.includes('/auth/refresh')) {
        await tokenStorage.removeTokens();
        isRefreshing = false;
        processQueue(new Error('Refresh token expired'), null);
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await tokenStorage.getRefreshToken();

        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await apiClient.post('/auth/refresh', {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data.data;

        await tokenStorage.saveTokens(accessToken, newRefreshToken);

        processQueue(null, accessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as Error, null);

        await tokenStorage.removeTokens();

        // Notification history and the coach-guide flag are deliberately left
        // alone here - they're only wiped at the *next* login, and only if
        // that login turns out to be a different account (see
        // ensureAccountLocalState in use-auth.ts). This is a silent session
        // expiry, not a user-initiated logout.
        const { useAuthStore, useLanguageStore } = await import('@/shared/stores');
        useLanguageStore.getState().setLanguage('en');
        const { clearAuth } = useAuthStore.getState();
        await clearAuth();

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export { apiClient };
