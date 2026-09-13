import { formatCompact } from './format.utils';

describe('formatCompact', () => {
  it('formats small amounts as plain decimals', () => {
    expect(formatCompact(12345)).toBe('123.45');
  });

  it('formats amounts under 1000 with two decimals', () => {
    expect(formatCompact(99999)).toBe('999.99');
  });

  it('formats thousands with a K suffix', () => {
    expect(formatCompact(150_000)).toBe('1.5K');
  });

  it('formats millions with an M suffix', () => {
    expect(formatCompact(2_500_000_00)).toBe('2.5M');
  });

  it('formats billions with a B suffix', () => {
    expect(formatCompact(3_000_000_000_00)).toBe('3.0B');
  });

  it('handles negative amounts using the absolute value for threshold checks', () => {
    expect(formatCompact(-150_000)).toBe('-1.5K');
  });

  it('handles zero', () => {
    expect(formatCompact(0)).toBe('0.00');
  });

  it('rounds small amounts to a whole number when roundToWhole is set', () => {
    expect(formatCompact(12345, true)).toBe('123');
    expect(formatCompact(12399, true)).toBe('124');
  });

  it('drops the compact-suffix decimal when roundToWhole is set', () => {
    expect(formatCompact(150_000, true)).toBe('2K');
    expect(formatCompact(2_500_000_00, true)).toBe('3M');
  });
});
