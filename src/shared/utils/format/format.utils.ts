export function formatCompact(cents: number, roundToWhole = false): string {
  const value = cents / 100;
  const decimals = roundToWhole ? 0 : 1;

  if (Math.abs(value) >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(decimals)}B`;
  }
  if (Math.abs(value) >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(decimals)}M`;
  }
  if (Math.abs(value) >= 1_000) {
    return `${(value / 1_000).toFixed(decimals)}K`;
  }
  return roundToWhole ? String(Math.round(value)) : value.toFixed(2);
}
