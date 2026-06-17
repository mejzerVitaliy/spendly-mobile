import { ChartType, TransactionType } from '@/shared/constants';
import { PeriodType } from '@/shared/utils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface AnalyticsState {
  periodType: PeriodType;
  currentDate: Date;
  startDate: string;
  endDate: string;
  selectedCategoryTransactionType: TransactionType;
  selectedCategoryChartType: ChartType;
  setPeriodType: (type: PeriodType) => void;
  setCurrentDate: (date: Date) => void;
  setDateRange: (startDate: string, endDate: string) => void;
  setSelectedCategoryTransactionType: (type: TransactionType) => void;
  setSelectedCategoryChartType: (type: ChartType) => void;
}

export const useAnalyticsStore = create<AnalyticsState>()(
  persist(
    (set) => ({
      periodType: 'month',
      currentDate: new Date(),
      startDate: '',
      endDate: '',
      selectedCategoryTransactionType: TransactionType.EXPENSE,
      selectedCategoryChartType: ChartType.BAR,
      setPeriodType: (type) => set({ periodType: type }),
      setCurrentDate: (date) => set({ currentDate: date }),
      setDateRange: (startDate, endDate) => set({ startDate, endDate }),
      setSelectedCategoryTransactionType: (type) => set({ selectedCategoryTransactionType: type }),
      setSelectedCategoryChartType: (type) => set({ selectedCategoryChartType: type }),
    }),
    {
      name: 'analytics-period-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ periodType: state.periodType }),
    },
  ),
);
