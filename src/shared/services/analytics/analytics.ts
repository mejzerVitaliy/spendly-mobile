import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { ENV } from '@/shared/constants/config';
import { tokenStorage } from '@/shared/services/storage';

const QUEUE_KEY = '@spendly_analytics_queue';
const FLUSH_INTERVAL_MS = 30_000;
const MAX_BATCH_SIZE = 20;

interface QueuedEvent {
  event: string;
  properties?: Record<string, unknown>;
  timestamp: number;
}

let queue: QueuedEvent[] = [];
let flushTimer: ReturnType<typeof setInterval> | null = null;
let initialized = false;

const saveQueue = async () => {
  try {
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch {}
};

const loadQueue = async () => {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    if (raw) queue = JSON.parse(raw);
  } catch {}
};

const sendBatch = async (batch: QueuedEvent[]) => {
  // The server derives userId from this token (falling back to an
  // anonymous event if there's none) - it never trusts a client-claimed
  // userId in the body, so there's no point sending one.
  const token = await tokenStorage.getAccessToken();
  const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

  await Promise.all(
    batch.map((item) =>
      axios
        .post(
          `${ENV.API_URL}/analytics/event`,
          { event: item.event, properties: item.properties ?? {}, timestamp: item.timestamp },
          { timeout: 5000, headers },
        )
        .catch(() => {}),
    ),
  );
};

const flushQueue = async () => {
  if (queue.length === 0) return;
  const batch = queue.splice(0, MAX_BATCH_SIZE);
  await saveQueue();
  try {
    await sendBatch(batch);
  } catch {
    queue.unshift(...batch);
    await saveQueue();
  }
};

export const analytics = {
  async init() {
    if (initialized) return;
    initialized = true;
    await loadQueue();
    flushTimer = setInterval(() => {
      flushQueue().catch(() => {});
    }, FLUSH_INTERVAL_MS);
  },

  track(event: string, properties?: Record<string, unknown>) {
    queue.push({ event, properties, timestamp: Date.now() });
    saveQueue().catch(() => {});
    if (queue.length >= MAX_BATCH_SIZE) {
      flushQueue().catch(() => {});
    }
  },

  async flush() {
    await flushQueue();
  },

  /**
   * Drops any events still queued locally without sending them - used on
   * logout/account deletion so events queued under the outgoing account
   * can't end up sent (and attributed) under whichever account logs in
   * next. Call flush() first if you want a last-chance attempt to send
   * them under the still-valid outgoing token.
   */
  async reset() {
    queue = [];
    try {
      await AsyncStorage.removeItem(QUEUE_KEY);
    } catch {}
  },
};
