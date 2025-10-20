import { ApiResponse } from "./api";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;

  avatarUrl?: string;
  totalBalance: number;
}

interface AuthStore {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => Promise<void>;
  clearAuth: () => Promise<void>;
  initializeAuth: () => Promise<void>;
}

interface RegisterRequest {
  firstName: string
  lastName: string
  email: string
  password: string
}

interface RegisterResponse 
  extends ApiResponse<{
    user: User
    accessToken: string
    refreshToken: string
  }> {}

interface LoginRequest {
  email: string
  password: string
}

interface VerifyTwoFactorRequest {
  email: string
  code: string
}

interface LoginResponse 
  extends ApiResponse<{
    user: User
    accessToken: string
    refreshToken: string
  }> {}

interface RefreshResponse 
  extends ApiResponse<{
    accessToken: string
    refreshToken: string
  }> {}

interface GetMeResponse 
  extends ApiResponse<User> {}

export {
  User,
  AuthStore,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  RefreshResponse,
  GetMeResponse,
  VerifyTwoFactorRequest,
}
