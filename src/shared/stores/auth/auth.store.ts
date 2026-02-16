import { tokenStorage } from '@/shared/services/storage';
import { authApi } from '@/shared/services/api/auth.api';
import { AuthStore, User } from '@/shared/types';
import { create } from 'zustand';

const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: async (user: User, accessToken: string, refreshToken: string) => {
    await tokenStorage.saveTokens(accessToken, refreshToken);

    set({
      user,
      accessToken,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  clearAuth: async () => {
    await tokenStorage.removeTokens();
    
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  initializeAuth: async () => {
    try {
      const accessToken = await tokenStorage.getAccessToken();
      const refreshToken = await tokenStorage.getRefreshToken();
      
      if (accessToken && refreshToken) {
        try {
          const response = await authApi.getMe();
          set({
            user: response.data,
            accessToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch {
          await tokenStorage.removeTokens();
          set({
            isAuthenticated: false,
            isLoading: false,
          });
        }
      } else {
        set({
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      set({
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },
}));

export { useAuthStore };
