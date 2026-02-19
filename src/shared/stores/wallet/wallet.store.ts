import { create } from 'zustand';
import { WalletDto, CreateWalletRequest, UpdateWalletRequest, TotalBalanceDto } from '@/shared/types';
import { walletApi } from '@/shared/services/api';

interface WalletState {
  wallets: WalletDto[];
  defaultWallet: WalletDto | null;
  totalBalance: TotalBalanceDto | null;
  isLoading: boolean;
  error: string | null;

  fetchWallets: (includeArchived?: boolean) => Promise<void>;
  fetchDefaultWallet: () => Promise<void>;
  fetchTotalBalance: () => Promise<void>;
  createWallet: (data: CreateWalletRequest) => Promise<WalletDto>;
  updateWallet: (id: string, data: UpdateWalletRequest) => Promise<void>;
  archiveWallet: (id: string) => Promise<void>;
  unarchiveWallet: (id: string) => Promise<void>;
  setDefaultWallet: (walletId: string) => Promise<void>;
  clearWallets: () => void;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  wallets: [],
  defaultWallet: null,
  totalBalance: null,
  isLoading: false,
  error: null,

  fetchWallets: async (includeArchived = false) => {
    set({ isLoading: true, error: null });
    try {
      const response = await walletApi.getAll(includeArchived);
      set({ wallets: response.data, isLoading: false });
    } catch {
      set({ error: 'Failed to fetch wallets', isLoading: false });
    }
  },

  fetchDefaultWallet: async () => {
    try {
      const response = await walletApi.getDefault();
      set({ defaultWallet: response.data });
    } catch {
      set({ error: 'Failed to fetch default wallet' });
    }
  },

  fetchTotalBalance: async () => {
    try {
      const response = await walletApi.getTotalBalance();
      set({ totalBalance: response.data });
    } catch {
      set({ error: 'Failed to fetch total balance' });
    }
  },

  createWallet: async (data: CreateWalletRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await walletApi.create(data);
      const newWallet = response.data;
      set((state) => ({
        wallets: [...state.wallets, newWallet],
        isLoading: false,
      }));
      if (newWallet.isDefault) {
        set({ defaultWallet: newWallet });
      }
      await get().fetchTotalBalance();
      return newWallet;
    } catch (error) {
      set({ error: 'Failed to create wallet', isLoading: false });
      throw error;
    }
  },

  updateWallet: async (id: string, data: UpdateWalletRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await walletApi.update(id, data);
      set((state) => ({
        wallets: state.wallets.map((w) => (w.id === id ? { ...w, ...response.data } : w)),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to update wallet', isLoading: false });
      throw error;
    }
  },

  archiveWallet: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await walletApi.archive(id);
      set((state) => ({
        wallets: state.wallets.map((w) => (w.id === id ? { ...w, isArchived: true } : w)),
        isLoading: false,
      }));
      await get().fetchTotalBalance();
    } catch (error) {
      set({ error: 'Failed to archive wallet', isLoading: false });
      throw error;
    }
  },

  unarchiveWallet: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await walletApi.unarchive(id);
      set((state) => ({
        wallets: state.wallets.map((w) => (w.id === id ? { ...w, isArchived: false } : w)),
        isLoading: false,
      }));
      await get().fetchTotalBalance();
    } catch (error) {
      set({ error: 'Failed to unarchive wallet', isLoading: false });
      throw error;
    }
  },

  setDefaultWallet: async (walletId: string) => {
    set({ isLoading: true, error: null });
    try {
      await walletApi.setDefault({ walletId });
      set((state) => ({
        wallets: state.wallets.map((w) => ({
          ...w,
          isDefault: w.id === walletId,
        })),
        defaultWallet: state.wallets.find((w) => w.id === walletId) || null,
        isLoading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to set default wallet', isLoading: false });
      throw error;
    }
  },

  clearWallets: () => {
    set({ wallets: [], defaultWallet: null, totalBalance: null, isLoading: false, error: null });
  },
}));
