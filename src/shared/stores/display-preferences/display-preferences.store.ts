import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface DisplayPreferencesState {
  roundAmounts: boolean;
  setRoundAmounts: (value: boolean) => void;
}

export const useDisplayPreferencesStore = create<DisplayPreferencesState>()(
  persist(
    (set) => ({
      roundAmounts: false,
      setRoundAmounts: (value) => set({ roundAmounts: value }),
    }),
    {
      name: 'spendly-display-preferences',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
