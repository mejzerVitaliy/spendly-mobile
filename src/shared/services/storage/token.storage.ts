import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

// Access Token (используется для запросов)
const saveAccessToken = async (token: string) => {
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
};

const getAccessToken = async () => {
  return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
};

// Refresh Token (используется для обновления accessToken)
const saveRefreshToken = async (token: string) => {
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
};

const getRefreshToken = async () => {
  return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
};

// Сохранить оба токена
const saveTokens = async (accessToken: string, refreshToken: string) => {
  await Promise.all([
    saveAccessToken(accessToken),
    saveRefreshToken(refreshToken),
  ]);
};

// Удалить все токены
const removeTokens = async () => {
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
};

export const tokenStorage = {
  saveAccessToken,
  getAccessToken,
  saveRefreshToken,
  getRefreshToken,
  saveTokens,
  removeTokens,
  
  // Для обратной совместимости (deprecated)
  saveToken: saveRefreshToken,
  getToken: getAccessToken,
  removeToken: removeTokens,
};
