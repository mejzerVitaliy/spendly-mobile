import { create } from 'zustand';

export interface CoachTarget {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CoachTargetsState {
  create: CoachTarget | null;
  analytics: CoachTarget | null;
  wallets: CoachTarget | null;
  setTarget: (key: 'create' | 'analytics' | 'wallets', target: CoachTarget) => void;
}

export const useCoachTargetsStore = create<CoachTargetsState>((set) => ({
  create: null,
  analytics: null,
  wallets: null,
  setTarget: (key, target) => set({ [key]: target }),
}));
