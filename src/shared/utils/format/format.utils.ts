/**
 * showFullAmount=false (default): today's existing behavior - abbreviate
 * >=1000 into K/M/B with one decimal (e.g. "10.6K").
 * showFullAmount=true: never abbreviate, always show the complete number
 * to the cent (e.g. "10607.62") - this is what the Settings toggle turns
 * on, for people who'd rather see the exact figure than a compacted one.
 */
export function formatCompact(cents: number, showFullAmount = false): string {
  const value = cents / 100;

  if (!showFullAmount) {
    if (Math.abs(value) >= 1_000_000_000) {
      return `${(value / 1_000_000_000).toFixed(1)}B`;
    }
    if (Math.abs(value) >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(1)}M`;
    }
    if (Math.abs(value) >= 1_000) {
      return `${(value / 1_000).toFixed(1)}K`;
    }
  }

  return value.toFixed(2);
}
