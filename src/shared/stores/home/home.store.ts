import { PeriodType, getDateRangeForPeriod } from '@/shared/utils';
import { create } from 'zustand';

interface HomeState {
  periodType: PeriodType;
  currentDate: Date;
  startDate: string;
  endDate: string;
  setPeriodType: (type: PeriodType) => void;
  setCurrentDate: (date: Date) => void;
  setDateRange: (startDate: string, endDate: string) => void;
}

const initialDate = new Date();
const initialPeriod = 'month';
const { startDate: initialStartDate, endDate: initialEndDate } = getDateRangeForPeriod(initialDate, initialPeriod);

export const useHomeStore = create<HomeState>((set) => ({
  periodType: initialPeriod,
  currentDate: initialDate,
  startDate: initialStartDate,
  endDate: initialEndDate,
  setPeriodType: (type) => set({ periodType: type }),
  setCurrentDate: (date) => set({ currentDate: date }),
  setDateRange: (startDate, endDate) => set({ startDate, endDate }),
}));
