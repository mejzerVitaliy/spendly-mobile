import { getDateRangeForPeriod, formatPeriodLabel, navigatePeriod, formatDateToYYYYMMDD } from './date.utils';

describe('formatDateToYYYYMMDD', () => {
  it('zero-pads month and day', () => {
    expect(formatDateToYYYYMMDD(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
});

describe('getDateRangeForPeriod', () => {
  it('returns a Monday-to-Sunday range for "week"', () => {
    // Wednesday, Jan 14 2026
    const range = getDateRangeForPeriod(new Date(2026, 0, 14), 'week');
    expect(range).toEqual({ startDate: '2026-01-12', endDate: '2026-01-18' });
  });

  it('keeps the week range correct when the anchor date is itself a Monday', () => {
    const range = getDateRangeForPeriod(new Date(2026, 0, 12), 'week');
    expect(range).toEqual({ startDate: '2026-01-12', endDate: '2026-01-18' });
  });

  it('keeps the week range correct when the anchor date is itself a Sunday', () => {
    const range = getDateRangeForPeriod(new Date(2026, 0, 18), 'week');
    expect(range).toEqual({ startDate: '2026-01-12', endDate: '2026-01-18' });
  });

  it('returns the full calendar month for "month"', () => {
    const range = getDateRangeForPeriod(new Date(2026, 0, 14), 'month');
    expect(range).toEqual({ startDate: '2026-01-01', endDate: '2026-01-31' });
  });

  it('handles February on a non-leap year', () => {
    const range = getDateRangeForPeriod(new Date(2026, 1, 10), 'month');
    expect(range).toEqual({ startDate: '2026-02-01', endDate: '2026-02-28' });
  });

  it('returns the full calendar year for "year"', () => {
    const range = getDateRangeForPeriod(new Date(2026, 5, 1), 'year');
    expect(range).toEqual({ startDate: '2026-01-01', endDate: '2026-12-31' });
  });
});

describe('navigatePeriod', () => {
  it('moves forward 7 days for "week" + next', () => {
    const next = navigatePeriod(new Date(2026, 0, 14), 'week', 'next');
    expect(formatDateToYYYYMMDD(next)).toBe('2026-01-21');
  });

  it('moves back 7 days for "week" + prev', () => {
    const prev = navigatePeriod(new Date(2026, 0, 14), 'week', 'prev');
    expect(formatDateToYYYYMMDD(prev)).toBe('2026-01-07');
  });

  it('moves forward one calendar month for "month" + next', () => {
    const next = navigatePeriod(new Date(2026, 0, 14), 'month', 'next');
    expect(formatDateToYYYYMMDD(next)).toBe('2026-02-14');
  });

  it('moves back one calendar month across a year boundary', () => {
    const prev = navigatePeriod(new Date(2026, 0, 14), 'month', 'prev');
    expect(formatDateToYYYYMMDD(prev)).toBe('2025-12-14');
  });

  it('moves forward one year for "year" + next', () => {
    const next = navigatePeriod(new Date(2026, 0, 14), 'year', 'next');
    expect(formatDateToYYYYMMDD(next)).toBe('2027-01-14');
  });

  it('documents current behavior: navigating from a month-end day can overflow into the month after next (e.g. Jan 31 -> Mar 3, not Feb 28)', () => {
    const next = navigatePeriod(new Date(2026, 0, 31), 'month', 'next');
    expect(formatDateToYYYYMMDD(next)).toBe('2026-03-03');
  });
});

describe('formatPeriodLabel', () => {
  it('formats a week label as "Mon D - Mon D"', () => {
    expect(formatPeriodLabel(new Date(2026, 0, 14), 'week')).toBe('Jan 12 - Jan 18');
  });

  it('formats a month label as "Month YYYY"', () => {
    expect(formatPeriodLabel(new Date(2026, 0, 14), 'month')).toBe('January 2026');
  });

  it('formats a year label as "YYYY"', () => {
    expect(formatPeriodLabel(new Date(2026, 0, 14), 'year')).toBe('2026');
  });
});
