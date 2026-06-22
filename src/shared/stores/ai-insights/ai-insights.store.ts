import { AiInsightItem } from '@/shared/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface CachedInsights {
  insights: AiInsightItem[];
  generatedAt: string;
}

interface AiInsightsState {
  cache: Record<string, CachedInsights>;
  setInsights: (key: string, data: CachedInsights) => void;
  getInsights: (key: string) => CachedInsights | undefined;
}

export const useAiInsightsStore = create<AiInsightsState>()(
  persist(
    (set, get) => ({
      cache: {},
      setInsights: (key, data) =>
        set((state) => ({ cache: { ...state.cache, [key]: data } })),
      getInsights: (key) => get().cache[key],
    }),
    {
      name: 'ai-insights-cache',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
