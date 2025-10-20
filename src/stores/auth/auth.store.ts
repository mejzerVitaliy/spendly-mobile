import { AuthStore, User } from '@/types';
import { create } from 'zustand';
import { tokenStorage } from '@/services/storage';

const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,

  // Установить авторизацию (после login/register)
  setAuth: async (user: User, accessToken: string, refreshToken: string) => {
    // Сохраняем оба токена в SecureStore
    await tokenStorage.saveTokens(accessToken, refreshToken);

    set({
      user,
      accessToken,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  // Очистить авторизацию (logout)
  clearAuth: async () => {
    // Удаляем оба токена из SecureStore
    await tokenStorage.removeTokens();
    
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  // Инициализация при старте приложения
  initializeAuth: async () => {
    try {
      // Проверяем есть ли accessToken
      const accessToken = await tokenStorage.getAccessToken();
      const refreshToken = await tokenStorage.getRefreshToken();
      
      if (accessToken && refreshToken) {
        // Токены есть - пользователь авторизован
        // Можно сделать запрос /auth/me для получения данных user
        set({
          accessToken,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        // Токенов нет - не авторизован
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