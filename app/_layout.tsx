import '@/shared/i18n';
import { useAuthStore, useLanguageStore } from '@/shared/stores';
import { analytics } from '@/shared/services/analytics';
import { crashReporting } from '@/shared/services/crash-reporting';
import { notificationService } from '@/shared/services/notifications';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Inter_400Regular, useFonts } from '@expo-google-fonts/inter';
import { useRecurringSync, useReports } from '@/shared/hooks';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { Platform, Text, TextInput, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import { toastConfig } from '@/shared/ui/toast-config';
import { AnimatedSplash, GlobalLoadingOverlay, GuestRegisterModal, OfflineBanner } from '@/shared/ui';
import '../src/global.css';
import { colors } from '@/shared/theme';
import * as Notifications from 'expo-notifications';
import { useTranslation } from 'react-i18next';

SplashScreen.preventAutoHideAsync();
// The native splash (app.json) is now just a solid black rect matching
// AnimatedSplash's own background, so this fade is a tiny safety-net blend
// for the handoff rather than the primary transition - AnimatedSplash's own
// sequence is what the user actually sees and waits through.
SplashScreen.setOptions({ duration: 300, fade: true });

crashReporting.init();

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
  const [splashDone, setSplashDone] = useState(false);
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
  });
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);
  const { t } = useTranslation();

  const { isAuthenticated, isLoading, initializeAuth, user } = useAuthStore();
  const { language } = useLanguageStore();
  const { sync: syncRecurring } = useRecurringSync();
  const isGuest = user?.type === 'GUEST';
  const { getSummary } = useReports({ enabled: isAuthenticated && isGuest });

  const routerRef = useRef(router);
  routerRef.current = router;
  const tRef = useRef(t);
  tRef.current = t;
  const syncRecurringRef = useRef(syncRecurring);
  syncRecurringRef.current = syncRecurring;
  const languageRef = useRef(language);
  languageRef.current = language;

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

  // Notification tap handling is independent of auth state (a stray
  // already-scheduled local notification could be tapped while logged out)
  // and only needs to register once - kept in its own effect, with router
  // read from a ref, so it doesn't re-subscribe on every navigation.
  useEffect(() => {
    notificationListener.current = Notifications.addNotificationReceivedListener((event) => {
      // Only the daily check-in (real local OS trigger) and real
      // server-dispatched pushes (streak/inactivity/weekly/monthly) arrive
      // here without already having an in-app entry - see
      // recordRemoteNotificationDelivered for why. It no-ops for anything
      // else (missing titleKey/bodyKey), so this is safe to call
      // unconditionally.
      notificationService.recordRemoteNotificationDelivered(
        event.request.content.data as Record<string, unknown> | undefined,
      );
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const type = response.notification.request.content.data?.type;
      if (type === 'weekly_summary' || type === 'monthly_recap' || type === 'spending_trend' || type === 'category_insight') {
        routerRef.current.push('/(tabs)/analytics' as any);
      } else if (type === 'guest_data_risk') {
        routerRef.current.push('/settings/create-account' as any);
      } else {
        routerRef.current.push('/notifications' as any);
      }
    });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  // Evaluate/schedule notifications and sync recurring transactions only once
  // auth has actually resolved to a logged-in user - this used to run
  // regardless of auth state (firing during onboarding/logout) and re-ran on
  // every `t`/`router` reference change (e.g. the language reset that
  // happens on logout), which is what caused notification bursts right after
  // logging out. t/syncRecurring are read from refs so a language change
  // doesn't re-trigger this effect while still using fresh values inside it.
  useEffect(() => {
    if (isLoading || !isMounted || !isAuthenticated) return;

    notificationService.requestPermissions().then(() => {
      notificationService.syncOnAppOpen(tRef.current as any);
      notificationService.registerForServerPush(languageRef.current as 'en' | 'ru');
    });

    syncRecurringRef.current();
  }, [isLoading, isMounted, isAuthenticated]);

  // Tier 3 of the guest-registration nudge - once the guest's all-time
  // transaction count is known, maybe warn them their data is device-only.
  // Separate from the effect above since it depends on report data that
  // loads asynchronously after auth resolves, not just on mount.
  useEffect(() => {
    if (isLoading || !isMounted || !getSummary.data) return;
    const totalTransactions = getSummary.data.data?.totalTransactions ?? 0;
    notificationService.maybeSendGuestDataRiskNotification(t as any, isGuest, totalTransactions);
  }, [isLoading, isMounted, isGuest, getSummary.data, t]);

  // AnimatedSplash renders its own solid-black background matching the
  // native splash, so hiding native splash as soon as this component mounts
  // is a seamless swap - AnimatedSplash's sequence, not the native splash,
  // is what actually holds the screen while fonts/auth load in the background.
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

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

  // Computed during render (not inside the effect below) so the redirect
  // check below can use it to skip rendering the Stack for the one frame
  // before the effect actually fires the navigation - router.replace() is a
  // side effect and has to happen in an effect, but knowing a redirect is
  // needed doesn't, and gating render on it is what actually avoids the
  // flash of the wrong route (e.g. onboarding briefly showing for an
  // already-authenticated user before the effect below replaces it).
  const inAuthGroup = segments[0] === '(auth)';
  const inOnboarding = (segments[0] as string) === '(onboarding)';
  const inPasswordReset = inAuthGroup && (segments[1] === 'forgot-password' || segments[1] === 'reset-password');
  const needsOnboardingRedirect = !isAuthenticated && !inAuthGroup && !inOnboarding;
  const needsTabsRedirect = isAuthenticated && !inPasswordReset && (inAuthGroup || inOnboarding || segments[0] === undefined);

  useEffect(() => {
    if (!isMounted || isLoading) return;

    if (needsOnboardingRedirect) {
      router.replace('/(onboarding)' as any);
    } else if (needsTabsRedirect) {
      router.replace('/(tabs)' as any);
    }
  }, [isMounted, isLoading, needsOnboardingRedirect, needsTabsRedirect, router]);

  if (!splashDone) {
    return <AnimatedSplash onFinish={() => setSplashDone(true)} />;
  }

  if (isLoading || !fontsLoaded) {
    return null;
  }

  if (isMounted && (needsOnboardingRedirect || needsTabsRedirect)) {
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
            <GuestRegisterModal />
            <GlobalLoadingOverlay />
            <Toast config={toastConfig} topOffset={Platform.OS === 'ios' ? 60 : 40} />
          </View>
        </BottomSheetModalProvider>
      </PersistQueryClientProvider>
    </GestureHandlerRootView>
  );
}
