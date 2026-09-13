import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from "@/shared/services/api";
import { analytics } from "@/shared/services/analytics/analytics";
import { notificationService } from "@/shared/services/notifications";
import { useAiInsightsStore, useAuthStore, useGuestPromptStore, useLanguageStore, useNotificationsStore, useOnboardingStore } from "@/shared/stores";
import { ForgotPasswordRequest, LoginRequest, LoginResponse, RegisterRequest, RegisterResponse, ResetPasswordRequest } from "@/shared/types";
import { QueryClient, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const KEYS_TO_CLEAR = [
  'spendly-query-cache',
  'home-period-store',
  'analytics-period-store',
  'ai-insights-cache',
];

const LAST_USER_ID_KEY = 'spendly-last-user-id';

/**
 * Notification history/cooldowns/streak and "has seen the coach guide" are
 * meant to survive the *same* user logging out and back in on their own
 * device - only a genuinely different account taking over the device should
 * lose them. So the wipe happens here, at the next login, gated on whether
 * the incoming user id differs from whoever was last signed in - not
 * unconditionally at logout (which used to wipe them even for the same user).
 */
const ensureAccountLocalState = async (userId: string) => {
  const lastUserId = await AsyncStorage.getItem(LAST_USER_ID_KEY);
  if (lastUserId && lastUserId !== userId) {
    useNotificationsStore.getState().reset();
    useOnboardingStore.getState().reset();
  }
  await AsyncStorage.setItem(LAST_USER_ID_KEY, userId);
};

/**
 * Wipes local/persisted state tied to the current session - used on both
 * logout and account deletion so a shared/handed-down device can't leak
 * cached AI insights, query cache, etc. to the next person who signs in.
 * Notification history and the coach-guide flag are deliberately NOT wiped
 * here - see ensureAccountLocalState, which decides that based on whether
 * the *next* login is actually a different account.
 */
const clearLocalAccountState = async (queryClient: QueryClient) => {
  queryClient.clear();

  // Last-chance send under the still-valid outgoing token, then drop
  // anything left so it can't get sent (and misattributed) under whoever
  // logs in next.
  await analytics.flush().catch(() => {});
  await analytics.reset();

  useAiInsightsStore.getState().reset();
  useGuestPromptStore.getState().reset();
  useLanguageStore.getState().setLanguage('en');

  await AsyncStorage.multiRemove(KEYS_TO_CLEAR);
};

const useAuth = () => {
  const queryClient = useQueryClient()
  const {setAuth, clearAuth, isAuthenticated} = useAuthStore()

  const useRegistrationMutation = () => useMutation({
    mutationKey: ['register'],
    mutationFn: (request: RegisterRequest) => authApi.register(request),
    onSuccess: async (response: RegisterResponse) => {
      await ensureAccountLocalState(response.data.user.id);
      setAuth(
        response.data.user,
        response.data.accessToken,
        response.data.refreshToken
      );

      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  })

  const useLoginMutation = () => useMutation({
    mutationKey: ['login'],
    mutationFn: (request: LoginRequest) => authApi.login(request),
    onSuccess: async (response: LoginResponse) => {
      await ensureAccountLocalState(response.data.user.id);
      setAuth(
        response.data.user,
        response.data.accessToken,
        response.data.refreshToken
      );

      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  })

  const useGetMeQuery = () => useQuery({
    queryKey: ['user'],
    queryFn: () => authApi.getMe(),
    enabled: isAuthenticated
  })

  const useLogoutMutation = () => useMutation({
    mutationKey: ['logout'],
    mutationFn: () =>
      // Unregister while the access token is still valid - clearAuth below
      // removes it, and the server can't authenticate the delete after that.
      Promise.all([authApi.logout(), notificationService.unregisterForServerPush()]),
    onSuccess: async () => {
      // Clear cache/stores/AsyncStorage first, then auth last - clearing
      // auth triggers navigation to onboarding.
      await clearLocalAccountState(queryClient);
      await clearAuth();
    },
  });

  const useForgotPasswordMutation = () => useMutation({
    mutationKey: ['forgotPassword'],
    mutationFn: (request: ForgotPasswordRequest) => authApi.forgotPassword(request),
  });

  const useResetPasswordMutation = () => useMutation({
    mutationKey: ['resetPassword'],
    mutationFn: (request: ResetPasswordRequest) => authApi.resetPassword(request),
  });

  return {
    registerMutation: useRegistrationMutation(),
    loginMutation: useLoginMutation(),
    getMeQuery: useGetMeQuery(),
    logoutMutation: useLogoutMutation(),
    forgotPasswordMutation: useForgotPasswordMutation(),
    resetPasswordMutation: useResetPasswordMutation(),
  }
}

export { useAuth, clearLocalAccountState, ensureAccountLocalState };
