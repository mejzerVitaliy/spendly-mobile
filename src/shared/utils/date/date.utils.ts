export type PeriodType = 'week' | 'month' | 'year';

export interface DateRange {
  startDate: string;
  endDate: string;
}

export const formatDateToYYYYMMDD = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getDateRangeForPeriod = (currentDate: Date, periodType: PeriodType): DateRange => {
  const date = new Date(currentDate);
  let startDate: Date;
  let endDate: Date;

  switch (periodType) {
    case 'week':
      const dayOfWeek = date.getDay();
      const diff = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      startDate = new Date(date.setDate(diff));
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
      break;

    case 'month':
      startDate = new Date(date.getFullYear(), date.getMonth(), 1);
      endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
      break;

    case 'year':
      startDate = new Date(date.getFullYear(), 0, 1);
      endDate = new Date(date.getFullYear(), 11, 31, 23, 59, 59, 999);
      break;
  }

  return {
    startDate: formatDateToYYYYMMDD(startDate),
    endDate: formatDateToYYYYMMDD(endDate),
  };
};

export const formatPeriodLabel = (currentDate: Date, periodType: PeriodType): string => {
  const date = new Date(currentDate);
  
  switch (periodType) {
    case 'week':
      const weekStart = new Date(date);
      const dayOfWeek = weekStart.getDay();
      const diff = weekStart.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      weekStart.setDate(diff);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    
    case 'month':
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    case 'year':
      return date.getFullYear().toString();
  }
};

export const navigatePeriod = (currentDate: Date, periodType: PeriodType, direction: 'prev' | 'next'): Date => {
  const newDate = new Date(currentDate);
  
  switch (periodType) {
    case 'week':
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
      break;
    case 'month':
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
      break;
    case 'year':
      newDate.setFullYear(newDate.getFullYear() + (direction === 'next' ? 1 : -1));
      break;
  }
  
  return newDate;
};
