import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface DisplayPreferencesState {
  showFullAmounts: boolean;
  setShowFullAmounts: (value: boolean) => void;
}

export const useDisplayPreferencesStore = create<DisplayPreferencesState>()(
  persist(
    (set) => ({
      showFullAmounts: false,
      setShowFullAmounts: (value) => set({ showFullAmounts: value }),
    }),
    {
      name: 'spendly-display-preferences',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
