import { TransactionType } from '@/shared/constants';
import { PeriodType } from '@/shared/utils';
import { create } from 'zustand';

interface AnalyticsState {
  periodType: PeriodType;
  currentDate: Date;
  startDate: string;
  endDate: string;
  selectedCategoryTransactionType: TransactionType;
  setPeriodType: (type: PeriodType) => void;
  setCurrentDate: (date: Date) => void;
  setDateRange: (startDate: string, endDate: string) => void;
  setSelectedCategoryTransactionType: (type: TransactionType) => void;
}

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  periodType: 'month',
  currentDate: new Date(),
  startDate: '',
  endDate: '',
  selectedCategoryTransactionType: TransactionType.EXPENSE,
  setPeriodType: (type) => set({ periodType: type }),
  setCurrentDate: (date) => set({ currentDate: date }),
  setDateRange: (startDate, endDate) => set({ startDate, endDate }),
  setSelectedCategoryTransactionType: (type) => set({ selectedCategoryTransactionType: type }),
}));
