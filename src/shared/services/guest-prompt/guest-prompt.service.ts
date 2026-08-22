import { useGuestPromptStore, GuestPromptTrigger } from '@/shared/stores/guest-prompt';

// Caps how many times a guest ever sees the registration modal, across all
// triggers combined - the whole point is a light nudge, not nagging.
const MAX_LIFETIME_MODALS = 3;
const COOLDOWN_DAYS = 7;
const STREAK_MILESTONES = [3, 7, 14];
const TRANSACTION_THRESHOLD = 25;

function daysSince(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
}

function isEligible(trigger: GuestPromptTrigger): boolean {
  const { modalShownCount, lastShownAt } = useGuestPromptStore.getState();
  if (modalShownCount >= MAX_LIFETIME_MODALS) return false;
  const last = lastShownAt[trigger];
  if (!last) return true;
  return daysSince(last) >= COOLDOWN_DAYS;
}

export const guestPromptService = {
  maybeShowForStreak(isGuest: boolean, streak: number) {
    if (!isGuest || !STREAK_MILESTONES.includes(streak)) return;
    if (useGuestPromptStore.getState().activeTrigger) return;
    if (!isEligible('streak')) return;
    useGuestPromptStore.getState().showModal('streak');
  },

  maybeShowForTransactionCount(isGuest: boolean, count: number) {
    if (!isGuest || count < TRANSACTION_THRESHOLD) return;
    if (useGuestPromptStore.getState().activeTrigger) return;
    if (!isEligible('transactions')) return;
    useGuestPromptStore.getState().showModal('transactions');
  },

  maybeShowForAnalyticsView(isGuest: boolean) {
    if (!isGuest) return;
    const { hasSeenAnalytics, markAnalyticsSeen, activeTrigger } = useGuestPromptStore.getState();
    if (hasSeenAnalytics) return;
    markAnalyticsSeen();
    if (activeTrigger) return;
    if (!isEligible('analytics_view')) return;
    useGuestPromptStore.getState().showModal('analytics_view');
  },

  daysSince,
  TRANSACTION_THRESHOLD,
};
