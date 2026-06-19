import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { ENV } from '@/shared/constants/config';
import { useAuthStore } from '@/shared/stores';

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
  const userId = useAuthStore.getState().user?.id ?? null;
  await Promise.all(
    batch.map((item) =>
      axios
        .post(
          `${ENV.API_URL}/analytics/event`,
          { userId, event: item.event, properties: item.properties ?? {}, timestamp: item.timestamp },
          { timeout: 5000 },
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
};
