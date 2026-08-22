import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/shared/theme';
import { useAuthStore, useGuestPromptStore } from '@/shared/stores';
import { useReports } from '@/shared/hooks';
import { analytics } from '@/shared/services/analytics';
import { guestPromptService } from '@/shared/services/guest-prompt';

const MIN_ACCOUNT_AGE_DAYS = 3;
const BANNER_COOLDOWN_DAYS = 7;

/**
 * Persistent, low-pressure Tier 1 nudge - shown inline on the home screen
 * (not a modal) once a guest account is a few days old. Dismissible, and
 * re-appears after a cooldown rather than being gone for good, since a
 * dismiss here means "not now", not "never".
 */
export function GuestRegisterBanner() {
  const router = useRouter();
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const bannerDismissedAt = useGuestPromptStore((s) => s.bannerDismissedAt);
  const dismissBanner = useGuestPromptStore((s) => s.dismissBanner);
  const isGuest = user?.type === 'GUEST';
  const { getSummary } = useReports({ enabled: isGuest });
  const totalTransactions = getSummary.data?.data?.totalTransactions ?? 0;

  const accountAgeDays = user?.createdAt ? guestPromptService.daysSince(user.createdAt) : 0;
  const cooldownPassed = !bannerDismissedAt || guestPromptService.daysSince(bannerDismissedAt) >= BANNER_COOLDOWN_DAYS;
  const shouldShow = isGuest && accountAgeDays >= MIN_ACCOUNT_AGE_DAYS && cooldownPassed;

  useEffect(() => {
    if (shouldShow) {
      analytics.track('account_prompt_shown', { trigger: 'banner', surface: 'banner' });
    }
  }, [shouldShow]);

  if (!shouldShow) return null;

  const highInvestment = totalTransactions >= 10;

  const handlePress = () => {
    analytics.track('account_prompt_accepted', { trigger: 'banner', surface: 'banner' });
    router.push('/settings/create-account' as any);
  };

  const handleDismiss = () => {
    analytics.track('account_prompt_dismissed', { trigger: 'banner', surface: 'banner' });
    dismissBanner();
  };

  return (
    <Pressable onPress={handlePress} style={styles.container}>
      <View style={styles.iconWrap}>
        <Ionicons name="shield-checkmark-outline" size={18} color={colors.info} />
      </View>
      <View style={styles.textWrap}>
        <Text style={styles.title}>
          {highInvestment
            ? t('guestPrompt.bannerHighInvestmentTitle', { count: totalTransactions })
            : t('guestPrompt.bannerLowInvestmentTitle')}
        </Text>
        <Text style={styles.subtitle}>{t('guestPrompt.bannerSubtitle')}</Text>
      </View>
      <Pressable onPress={handleDismiss} hitSlop={10} style={styles.closeButton}>
        <Ionicons name="close" size={16} color={colors.mutedForeground} />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 12,
    borderRadius: 16,
    backgroundColor: colors.info + '14',
    borderWidth: 1,
    borderColor: colors.info + '33',
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.info + '1A',
  },
  textWrap: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.foreground,
  },
  subtitle: {
    fontSize: 12,
    color: colors.mutedForeground,
  },
  closeButton: {
    padding: 4,
  },
});
