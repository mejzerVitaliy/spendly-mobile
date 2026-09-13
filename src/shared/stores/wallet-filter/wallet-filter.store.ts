import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface WalletFilterState {
  // null means "all wallets" - the default, previous behavior.
  selectedWalletId: string | null;
  setSelectedWalletId: (walletId: string | null) => void;
}

export const useWalletFilterStore = create<WalletFilterState>()(
  persist(
    (set) => ({
      selectedWalletId: null,
      setSelectedWalletId: (walletId) => set({ selectedWalletId: walletId }),
    }),
    {
      name: 'spendly-wallet-filter',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
