import * as StoreReview from 'expo-store-review';
import { useAuthStore } from '@/shared/stores';

// "People who just downloaded the app" - gate to recently-created accounts.
// A user who's been active for months gets excluded here even if they never
// saw the prompt before; the store's own review API already throttles
// repeat asks (iOS shows the native sheet at most a few times a year, with
// its own cooldown between actual displays we don't control or observe), so
// this narrows *when in a user's lifecycle* we even try - favoring their
// first "wow, that just worked" moments over someone who's used the app for
// a year and is unlikely to be freshly delighted by it.
const NEW_USER_WINDOW_DAYS = 14;

// Resets only on a fresh app launch (module-level, not persisted) - a user
// who creates five transactions in one sitting should be asked at most once,
// but a genuinely new session gets another chance.
let hasPromptedThisSession = false;

function daysSince(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
}

/**
 * Call after any successful transaction creation (manual, AI text, AI
 * voice, transfer). Cheap and safe to call liberally - all the actual
 * gating (session cap, new-user window, platform availability) lives here,
 * and requestReview() itself is a silent no-op when the OS has decided not
 * to show anything, so there's no risk of over-prompting by calling this
 * often.
 */
const maybePromptForReview = async (): Promise<void> => {
  if (hasPromptedThisSession) return;

  const user = useAuthStore.getState().user;
  if (!user?.createdAt) return;
  if (daysSince(user.createdAt) > NEW_USER_WINDOW_DAYS) return;

  // Claim the session's one shot before the first await, not after - two
  // transactions created back to back (e.g. AI parsing several at once)
  // would otherwise both pass the check above before either flips the flag.
  hasPromptedThisSession = true;

  try {
    const isAvailable = await StoreReview.isAvailableAsync();
    if (!isAvailable) return;
    await StoreReview.requestReview();
  } catch (err) {
    // Native review prompt is a nice-to-have - never worth surfacing to the
    // user or interrupting their flow over.
    console.warn('[reviewPrompt] requestReview failed', err);
  }
};

export const reviewPromptService = {
  maybePromptForReview,
};
