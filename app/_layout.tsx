import '@/shared/i18n';
import { useAuthStore, useLanguageStore } from '@/shared/stores';
import { analytics } from '@/shared/services/analytics';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Inter_400Regular, useFonts } from '@expo-google-fonts/inter';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Platform, Text, TextInput, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import { toastConfig } from '@/shared/ui/toast-config';
import '../src/global.css';
import { colors } from '@/shared/theme';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 0,
      refetchOnMount: true,
    },
  },
});

function RootNavigator() {
  const router = useRouter();
  const segments = useSegments();
  const [isMounted, setIsMounted] = useState(false);
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
  });

  const { isAuthenticated, isLoading, initializeAuth } = useAuthStore();
  useLanguageStore();

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

  useEffect(() => {
    if (!fontsLoaded || isLoading) return;

    SplashScreen.hideAsync();
  }, [fontsLoaded, isLoading]);

  useEffect(() => {
    const TextWithDefaults = Text as unknown as { defaultProps?: { style?: unknown } };
    TextWithDefaults.defaultProps = TextWithDefaults.defaultProps || {};
    TextWithDefaults.defaultProps.style = [{ fontFamily: 'Inter_400Regular' }, TextWithDefaults.defaultProps.style];

    const TextInputWithDefaults = TextInput as unknown as { defaultProps?: { style?: unknown } };
    TextInputWithDefaults.defaultProps = TextInputWithDefaults.defaultProps || {};
    TextInputWithDefaults.defaultProps.style = [
      { fontFamily: 'Inter_400Regular' },
      TextInputWithDefaults.defaultProps.style,
    ];
  }, []);

  useEffect(() => {
    if (!isMounted || isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboarding = (segments[0] as string) === '(onboarding)';

    if (!isAuthenticated && !inAuthGroup && !inOnboarding) {
      router.replace('/(onboarding)' as any);
    } else if (isAuthenticated && (inAuthGroup || inOnboarding || segments[0] === undefined)) {
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
      </Stack>
      <StatusBar style="light" />
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      <QueryClientProvider client={queryClient}>
        <BottomSheetModalProvider>
          <View style={{ flex: 1, backgroundColor: colors.background }}>
            <RootNavigator />
            <Toast config={toastConfig} />
          </View>
        </BottomSheetModalProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
