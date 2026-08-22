import Constants from 'expo-constants';

const ENV = {
  API_URL: Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL || process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api',
  SENTRY_DSN: Constants.expoConfig?.extra?.EXPO_PUBLIC_SENTRY_DSN || process.env.EXPO_PUBLIC_SENTRY_DSN || '',
};

export { ENV };
