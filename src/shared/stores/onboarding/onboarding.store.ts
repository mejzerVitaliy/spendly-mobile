import { create } from 'zustand';

interface OnboardingState {
  step: number;
  completed: boolean;

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
  reset: () => void;
}

const INITIAL_STATE = {
  step: 0,
  completed: false,
  mainCurrencyCode: 'USD',
  favoriteCategories: [] as string[],
  walletInitialBalance: 0,
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  ...INITIAL_STATE,

  setStep: (step) => set({ step }),
  nextStep: () => set((state) => ({ step: state.step + 1 })),
  prevStep: () => set((state) => ({ step: Math.max(0, state.step - 1) })),
  setMainCurrencyCode: (code) => set({ mainCurrencyCode: code }),
  setFavoriteCategories: (ids) => set({ favoriteCategories: ids }),
  setWalletInitialBalance: (balance) => set({ walletInitialBalance: balance }),
  setCompleted: (completed) => set({ completed }),
  reset: () => set(INITIAL_STATE),
}));
