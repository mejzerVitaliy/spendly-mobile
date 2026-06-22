import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from "@/shared/services/api";
import { useAuthStore, useLanguageStore, useNotificationsStore, useOnboardingStore } from "@/shared/stores";
import { ForgotPasswordRequest, LoginRequest, LoginResponse, RegisterRequest, RegisterResponse, ResetPasswordRequest } from "@/shared/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const KEYS_TO_CLEAR = [
  'spendly-query-cache',
  'home-period-store',
  'analytics-period-store',
];

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
      // 1. Clear in-memory query cache
      queryClient.clear();

      // 2. Reset all user-specific Zustand stores
      useOnboardingStore.getState().reset();
      useNotificationsStore.getState().reset();

      // 3. Reset language to English
      useLanguageStore.getState().setLanguage('en');

      // 4. Remove persisted AsyncStorage data (query cache + UI preferences)
      await AsyncStorage.multiRemove(KEYS_TO_CLEAR);

      // 5. Clear auth last — triggers navigation to onboarding
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

export { useAuth };
