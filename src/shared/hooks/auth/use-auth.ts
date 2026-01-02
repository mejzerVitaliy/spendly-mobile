import { authApi } from "@/shared/services/api";
import { useAuthStore } from "@/shared/stores";
import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from "@/shared/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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
    onSuccess: () => {
      clearAuth();
    },
  });

  return {
    registerMutation: useRegistrationMutation(),
    loginMutation: useLoginMutation(),
    getMeQuery: useGetMeQuery(),
    logoutMutation: useLogoutMutation(),
  }
}

export { useAuth };

