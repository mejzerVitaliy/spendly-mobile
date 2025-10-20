import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores";
import { authApi } from "@/services/api";
import { RegisterResponse, LoginResponse, RegisterRequest, LoginRequest } from "@/types";

const useAuth = () => {
  const queryClient = useQueryClient()
  const {setAuth, clearAuth} = useAuthStore()

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
    queryKey: ['me'],
    queryFn: () => authApi.getMe()
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

export { useAuth }

