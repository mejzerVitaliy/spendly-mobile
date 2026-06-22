import { ApiResponse } from "../api";

type UserType = 'GUEST' | 'REGISTERED';

interface User {
  id: string;
  type: UserType;
  email?: string | null;
  avatarUrl?: string;
  totalBalance: number;
  mainCurrencyCode: string;
  onboardingCompleted: boolean;
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

interface GuestRequest {
  mainCurrencyCode: string;
  favoriteCategories: string[];
  walletInitialBalance?: number;
}

interface GuestResponse
  extends ApiResponse<{
    user: User;
    accessToken: string;
    refreshToken: string;
  }> {}

interface UpgradeGuestRequest {
  email: string;
  password: string;
}

interface UpgradeGuestResponse
  extends ApiResponse<{
    user: User;
    accessToken: string;
    refreshToken: string;
  }> {}

interface RegisterRequest {
  email: string;
  password: string;
}

interface RegisterResponse
  extends ApiResponse<{
    user: User;
    accessToken: string;
    refreshToken: string;
  }> {}

interface LoginRequest {
  email: string;
  password: string;
}

interface VerifyTwoFactorRequest {
  email: string;
  code: string;
}

interface LoginResponse
  extends ApiResponse<{
    user: User;
    accessToken: string;
    refreshToken: string;
  }> {}

interface RefreshResponse
  extends ApiResponse<{
    accessToken: string;
    refreshToken: string;
  }> {}

interface GetMeResponse
  extends ApiResponse<User> {}

interface UpdateSettingsRequest {
  mainCurrencyCode: string;
}
interface UpdateSettingsResponse extends ApiResponse<null> {}

interface UpdateEmailRequest {
  email: string;
}
interface UpdateEmailResponse extends ApiResponse<null> {}

interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
interface ChangePasswordResponse extends ApiResponse<null> {}

interface DeleteAccountResponse extends ApiResponse<null> {}

interface ForgotPasswordRequest {
  email: string;
}

interface ForgotPasswordResponse extends ApiResponse<null> {}

interface ResetPasswordRequest {
  token: string;
  password: string;
}

interface ResetPasswordResponse extends ApiResponse<null> {}

export {
  AuthStore, GetMeResponse, GuestRequest, GuestResponse,
  LoginRequest, LoginResponse, RefreshResponse,
  RegisterRequest, RegisterResponse,
  UpdateSettingsRequest, UpdateSettingsResponse,
  UpdateEmailRequest, UpdateEmailResponse,
  ChangePasswordRequest, ChangePasswordResponse,
  DeleteAccountResponse,
  UpgradeGuestRequest, UpgradeGuestResponse,
  User, UserType, VerifyTwoFactorRequest,
  ForgotPasswordRequest, ForgotPasswordResponse,
  ResetPasswordRequest, ResetPasswordResponse,
};

