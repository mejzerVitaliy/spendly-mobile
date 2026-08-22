import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ConfirmDialog } from './confirm-dialog';
import { useAuthStore, useGuestPromptStore, useNotificationsStore } from '@/shared/stores';
import { useReports } from '@/shared/hooks';
import { guestPromptService } from '@/shared/services/guest-prompt';
import { analytics } from '@/shared/services/analytics';

/**
 * Always mounted (in the root layout) so it can watch guest engagement
 * signals - current streak, total transaction count - and pop the
 * registration nudge modal when a trigger fires. Rendering is driven by
 * `activeTrigger` in the guest-prompt store; the actual show/cooldown/cap
 * logic lives in guestPromptService, not here.
 */
export function GuestRegisterModal() {
  const router = useRouter();
  const { t } = useTranslation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isGuest = useAuthStore((s) => s.user?.type === 'GUEST');
  const currentStreak = useNotificationsStore((s) => s.currentStreak);
  const activeTrigger = useGuestPromptStore((s) => s.activeTrigger);
  const hideModal = useGuestPromptStore((s) => s.hideModal);
  const { getSummary } = useReports({ enabled: isAuthenticated && isGuest });
  const totalTransactions = getSummary.data?.data?.totalTransactions ?? 0;

  useEffect(() => {
    guestPromptService.maybeShowForStreak(isGuest, currentStreak);
  }, [isGuest, currentStreak]);

  useEffect(() => {
    guestPromptService.maybeShowForTransactionCount(isGuest, totalTransactions);
  }, [isGuest, totalTransactions]);

  useEffect(() => {
    if (activeTrigger) {
      analytics.track('account_prompt_shown', { trigger: activeTrigger, surface: 'modal' });
    }
  }, [activeTrigger]);

  if (!activeTrigger) return null;

  const copy = {
    streak: {
      title: t('guestPrompt.streakTitle', { days: currentStreak }),
      message: t('guestPrompt.streakMessage'),
    },
    transactions: {
      title: t('guestPrompt.transactionsTitle'),
      message: t('guestPrompt.transactionsMessage', { count: totalTransactions }),
    },
    analytics_view: {
      title: t('guestPrompt.analyticsTitle'),
      message: t('guestPrompt.analyticsMessage'),
    },
  }[activeTrigger];

  const handleConfirm = () => {
    analytics.track('account_prompt_accepted', { trigger: activeTrigger, surface: 'modal' });
    hideModal();
    router.push('/settings/create-account' as any);
  };

  const handleCancel = () => {
    analytics.track('account_prompt_dismissed', { trigger: activeTrigger, surface: 'modal' });
    hideModal();
  };

  return (
    <ConfirmDialog
      visible
      title={copy.title}
      message={copy.message}
      confirmText={t('guestPrompt.cta')}
      cancelText={t('guestPrompt.notNow')}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  );
}
