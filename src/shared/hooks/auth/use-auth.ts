import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from "@/shared/services/api";
import { analytics } from "@/shared/services/analytics/analytics";
import { useAiInsightsStore, useAuthStore, useGuestPromptStore, useLanguageStore, useNotificationsStore, useOnboardingStore } from "@/shared/stores";
import { ForgotPasswordRequest, LoginRequest, LoginResponse, RegisterRequest, RegisterResponse, ResetPasswordRequest } from "@/shared/types";
import { QueryClient, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const KEYS_TO_CLEAR = [
  'spendly-query-cache',
  'home-period-store',
  'analytics-period-store',
  'ai-insights-cache',
];

/**
 * Wipes every piece of local/persisted state tied to the current account -
 * used on both logout and account deletion so a shared/handed-down device
 * can't leak one user's data (cached AI insights, query cache, streaks,
 * notification prefs, ...) to the next person who signs in.
 */
const clearLocalAccountState = async (queryClient: QueryClient) => {
  queryClient.clear();

  // Last-chance send under the still-valid outgoing token, then drop
  // anything left so it can't get sent (and misattributed) under whoever
  // logs in next.
  await analytics.flush().catch(() => {});
  await analytics.reset();

  useOnboardingStore.getState().reset();
  useNotificationsStore.getState().reset();
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
    onSuccess: (response: RegisterResponse) => {
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
    onSuccess: (response: LoginResponse) => {
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
    mutationFn: () => authApi.logout(),
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

export { useAuth, clearLocalAccountState };
