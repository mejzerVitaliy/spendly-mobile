import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface OnboardingState {
  step: number;
  completed: boolean;
  hasSeenCoach: boolean;
  pendingOpenCreate: boolean;

  mainCurrencyCode: string;
  favoriteCategories: string[];
  walletInitialBalance: number;

  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setMainCurrencyCode: (code: string) => void;
  setFavoriteCategories: (ids: string[]) => void;
  setWalletInitialBalance: (balance: number) => void;
  setCompleted: (completed: boolean) => void;
  setHasSeenCoach: (seen: boolean) => void;
  setPendingOpenCreate: (pending: boolean) => void;
  reset: () => void;
}

const INITIAL_STATE = {
  step: 0,
  completed: false,
  hasSeenCoach: false,
  pendingOpenCreate: false,
  mainCurrencyCode: 'USD',
  favoriteCategories: [] as string[],
  walletInitialBalance: 0,
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      ...INITIAL_STATE,

      setStep: (step) => set({ step }),
      nextStep: () => set((state) => ({ step: state.step + 1 })),
      prevStep: () => set((state) => ({ step: Math.max(0, state.step - 1) })),
      setMainCurrencyCode: (code) => set({ mainCurrencyCode: code }),
      setFavoriteCategories: (ids) => set({ favoriteCategories: ids }),
      setWalletInitialBalance: (balance) => set({ walletInitialBalance: balance }),
      setCompleted: (completed) => set({ completed }),
      setHasSeenCoach: (seen) => set({ hasSeenCoach: seen }),
      setPendingOpenCreate: (pending) => set({ pendingOpenCreate: pending }),
      reset: () => set(INITIAL_STATE),
    }),
    {
      name: 'spendly-onboarding',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ hasSeenCoach: state.hasSeenCoach }),
    },
  ),
);
