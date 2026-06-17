import { PeriodType, getDateRangeForPeriod } from '@/shared/utils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

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
const initialPeriod: PeriodType = 'month';
const { startDate: initialStartDate, endDate: initialEndDate } = getDateRangeForPeriod(initialDate, initialPeriod);

export const useHomeStore = create<HomeState>()(
  persist(
    (set) => ({
      periodType: initialPeriod,
      currentDate: initialDate,
      startDate: initialStartDate,
      endDate: initialEndDate,
      setPeriodType: (type) => set({ periodType: type }),
      setCurrentDate: (date) => set({ currentDate: date }),
      setDateRange: (startDate, endDate) => set({ startDate, endDate }),
    }),
    {
      name: 'home-period-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ periodType: state.periodType }),
    },
  ),
);
