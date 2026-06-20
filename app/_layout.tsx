import '@/shared/i18n';
import { useAuthStore, useLanguageStore } from '@/shared/stores';
import { analytics } from '@/shared/services/analytics';
import { notificationService } from '@/shared/services/notifications';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Inter_400Regular, useFonts } from '@expo-google-fonts/inter';
import { useRecurringSync } from '@/shared/hooks';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { Platform, Text, TextInput, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import { toastConfig } from '@/shared/ui/toast-config';
import { OfflineBanner } from '@/shared/ui';
import '../src/global.css';
import { colors } from '@/shared/theme';
import * as Notifications from 'expo-notifications';
import { useTranslation } from 'react-i18next';

SplashScreen.preventAutoHideAsync();

const DAY = 24 * 60 * 60 * 1000;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 0,
      refetchOnMount: true,
      gcTime: DAY,
    },
  },
});

const persister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'spendly-query-cache',
  throttleTime: 2000,
});

const persistOptions = {
  persister,
  maxAge: 7 * DAY,
  buster: 'v1',
  dehydrateOptions: {
    shouldDehydrateQuery: (query: { queryKey: unknown[]; state: { status: string } }) => {
      if (query.state.status !== 'success') return false;
      const [key, params] = query.queryKey as [string, Record<string, unknown>?];
      // skip search results — change on every keystroke, wasteful to persist
      if (key === 'transactions' && params?.search) return false;
      return true;
    },
  },
};

function RootNavigator() {
  const router = useRouter();
  const segments = useSegments();
  const [isMounted, setIsMounted] = useState(false);
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
  });
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);
  const { t } = useTranslation();

  const { isAuthenticated, isLoading, initializeAuth } = useAuthStore();
  useLanguageStore();
  const { sync: syncRecurring } = useRecurringSync();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const init = async () => {
      await analytics.init();
      analytics.track('app_open');
      await initializeAuth();
    };

    init();
  }, [initializeAuth]);

  // Initialize notifications after auth is resolved
  useEffect(() => {
    if (isLoading || !isMounted) return;

    notificationService.requestPermissions().then(() => {
      notificationService.syncOnAppOpen(t as any);
    });

    if (isAuthenticated) {
      syncRecurring();
    }

    // Handle notification tap when app is in foreground
    notificationListener.current = Notifications.addNotificationReceivedListener(() => {});

    // Handle tap on notification (opens app or brings to foreground)
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const type = response.notification.request.content.data?.type;
      if (type === 'weekly_summary' || type === 'monthly_recap' || type === 'spending_trend' || type === 'category_insight') {
        router.push('/(tabs)/analytics' as any);
      } else {
        router.push('/notifications' as any);
      }
    });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [isLoading, isMounted, t, router]);

  useEffect(() => {
    if (!fontsLoaded || isLoading) return;

    SplashScreen.hideAsync();
  }, [fontsLoaded, isLoading]);

  useEffect(() => {
    const isAndroid = Platform.OS === 'android';
    const baseTextStyle = isAndroid
      ? { fontFamily: 'Inter_400Regular', fontSize: 13 }
      : { fontFamily: 'Inter_400Regular' };

    const TextWithDefaults = Text as unknown as {
      defaultProps?: { style?: unknown; allowFontScaling?: boolean; maxFontSizeMultiplier?: number };
    };
    TextWithDefaults.defaultProps = TextWithDefaults.defaultProps || {};
    TextWithDefaults.defaultProps.style = [baseTextStyle, TextWithDefaults.defaultProps.style];
    TextWithDefaults.defaultProps.allowFontScaling = false;
    TextWithDefaults.defaultProps.maxFontSizeMultiplier = 1;

    const TextInputWithDefaults = TextInput as unknown as {
      defaultProps?: { style?: unknown; allowFontScaling?: boolean; maxFontSizeMultiplier?: number };
    };
    TextInputWithDefaults.defaultProps = TextInputWithDefaults.defaultProps || {};
    TextInputWithDefaults.defaultProps.style = [baseTextStyle, TextInputWithDefaults.defaultProps.style];
    TextInputWithDefaults.defaultProps.allowFontScaling = false;
    TextInputWithDefaults.defaultProps.maxFontSizeMultiplier = 1;
  }, []);

  useEffect(() => {
    if (!isMounted || isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboarding = (segments[0] as string) === '(onboarding)';
    const inPasswordReset = inAuthGroup && (segments[1] === 'forgot-password' || segments[1] === 'reset-password');

    if (!isAuthenticated && !inAuthGroup && !inOnboarding) {
      router.replace('/(onboarding)' as any);
    } else if (isAuthenticated && !inPasswordReset && (inAuthGroup || inOnboarding || segments[0] === undefined)) {
      router.replace('/(tabs)' as any);
    }
  }, [isMounted, isAuthenticated, segments, isLoading, router]);

  if (isLoading || !fontsLoaded) {
    return null;
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="notifications" options={{ headerShown: false, animation: 'slide_from_right' }} />
      </Stack>
      <StatusBar style="light" />
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      <PersistQueryClientProvider client={queryClient} persistOptions={persistOptions}>
        <BottomSheetModalProvider>
          <View style={{ flex: 1, backgroundColor: colors.background }}>
            <RootNavigator />
            <OfflineBanner />
            <Toast config={toastConfig} topOffset={Platform.OS === 'ios' ? 60 : 40} />
          </View>
        </BottomSheetModalProvider>
      </PersistQueryClientProvider>
    </GestureHandlerRootView>
  );
}
