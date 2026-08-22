import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type GuestPromptTrigger = 'streak' | 'transactions' | 'analytics_view';

interface GuestPromptState {
  // Lifetime cap on how many times the modal has been shown, across all triggers
  modalShownCount: number;
  // Per-trigger cooldown: trigger -> ISO date it was last shown
  lastShownAt: Record<string, string>;
  bannerDismissedAt: string | null;
  hasSeenAnalytics: boolean;
  // Which modal is currently on screen, if any - transient, not persisted
  activeTrigger: GuestPromptTrigger | null;

  showModal: (trigger: GuestPromptTrigger) => void;
  hideModal: () => void;
  dismissBanner: () => void;
  markAnalyticsSeen: () => void;
  reset: () => void;
}

const INITIAL_STATE = {
  modalShownCount: 0,
  lastShownAt: {} as Record<string, string>,
  bannerDismissedAt: null as string | null,
  hasSeenAnalytics: false,
  activeTrigger: null as GuestPromptTrigger | null,
};

export const useGuestPromptStore = create<GuestPromptState>()(
  persist(
    (set) => ({
      ...INITIAL_STATE,

      showModal: (trigger) =>
        set((s) => ({
          activeTrigger: trigger,
          modalShownCount: s.modalShownCount + 1,
          lastShownAt: { ...s.lastShownAt, [trigger]: new Date().toISOString() },
        })),

      hideModal: () => set({ activeTrigger: null }),

      dismissBanner: () => set({ bannerDismissedAt: new Date().toISOString() }),

      markAnalyticsSeen: () => set({ hasSeenAnalytics: true }),

      reset: () => set(INITIAL_STATE),
    }),
    {
      name: 'spendly-guest-prompt',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        modalShownCount: state.modalShownCount,
        lastShownAt: state.lastShownAt,
        bannerDismissedAt: state.bannerDismissedAt,
        hasSeenAnalytics: state.hasSeenAnalytics,
      }),
    },
  ),
);
