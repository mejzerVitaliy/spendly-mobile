import { GetMeResponse, GuestRequest, GuestResponse, LoginRequest, LoginResponse, RefreshResponse, RegisterRequest, RegisterResponse, UpgradeGuestRequest, UpgradeGuestResponse } from "@/shared/types";
import { apiClient } from "./api";

const guest = async (request: GuestRequest): Promise<GuestResponse> => {
  const response = await apiClient.post(
    "/auth/guest",
    request
  );

  return response.data;
};

const upgradeGuest = async (request: UpgradeGuestRequest): Promise<UpgradeGuestResponse> => {
  const response = await apiClient.post(
    "/auth/upgrade",
    request
  );

  return response.data;
};

const register = async (request: RegisterRequest): Promise<RegisterResponse> => {
  const response = await apiClient.post(
    "/auth/register",
    request
  );

  return response.data;
};

const login = async (request: LoginRequest): Promise<LoginResponse> => {
  const response = await apiClient.post(
    "/auth/login", 
    request
  );
  
  return response.data;
};

const refresh = async (refreshToken: string): Promise<RefreshResponse> => {
  const response = await apiClient.post(
    "/auth/refresh",
    { refreshToken }
  );

  return response.data;
};

const resendTwoFactorCode = async (email: string) => {
  await apiClient.post("/auth/login/two-factor/resend", { email });
};

const toggleTwoFactor = async () => {
  await apiClient.put("/auth/toggle-two-factor");
};

const getMe = async (): Promise<GetMeResponse> => {
  const response = await apiClient.get("/auth/me");

  return response.data;
};

const logout = async () => {
  await apiClient.put("/auth/logout");
};

export const authApi = {
  guest,
  upgradeGuest,
  register,
  login,
  refresh,
  toggleTwoFactor,
  getMe,
  logout,
  resendTwoFactorCode,
};