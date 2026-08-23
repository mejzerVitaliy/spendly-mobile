import { create } from 'zustand';

// Ref-counted, not a plain boolean - a currency change and a language
// change could in principle overlap, and if a second show() land while the
// first is still pending, a naive hide() from whichever finishes first
// would drop the overlay while the other operation is still running.
interface GlobalLoadingState {
  count: number;
  show: () => void;
  hide: () => void;
}

export const useGlobalLoadingStore = create<GlobalLoadingState>((set) => ({
  count: 0,
  show: () => set((s) => ({ count: s.count + 1 })),
  hide: () => set((s) => ({ count: Math.max(0, s.count - 1) })),
}));

/**
 * Wraps a long-running async operation (a mutation that cascades into a
 * bunch of query refetches, e.g. changing main currency or app language)
 * with the global loading overlay - shows it before starting, hides it
 * once settled, success or failure either way.
 */
export async function withGlobalLoading<T>(fn: () => Promise<T>): Promise<T> {
  useGlobalLoadingStore.getState().show();
  try {
    return await fn();
  } finally {
    useGlobalLoadingStore.getState().hide();
  }
}
