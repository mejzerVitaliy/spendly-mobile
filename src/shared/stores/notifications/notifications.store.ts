import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type NotificationType =
  | 'daily_checkin'
  | 'weekly_summary'
  | 'monthly_recap'
  | 'streak'
  | 'inactivity'
  | 'spending_trend'
  | 'category_insight'
  | 'no_income'
  | 'recurring_due';

export interface AppNotification {
  id: string;
  type: NotificationType;
  titleKey: string;
  bodyKey: string;
  bodyParams?: Record<string, string | number>;
  receivedAt: string;
  read: boolean;
}

interface NotificationsState {
  notifications: AppNotification[];
  // Metadata for smart scheduling rules
  lastTransactionDate: string | null;
  currentStreak: number;
  lastStreakDate: string | null;
  // Cooldown tracking: type → ISO date of last sent
  cooldowns: Record<string, string>;
  // Push permission granted by OS
  permissionGranted: boolean;
  // User preference — can disable push while keeping in-app notifications
  pushNotificationsEnabled: boolean;

  addNotification: (n: Omit<AppNotification, 'id' | 'receivedAt' | 'read'>) => void;
  markAllRead: () => void;
  markRead: (id: string) => void;
  clearAll: () => void;
  setLastTransactionDate: (date: string) => void;
  updateStreak: (date: string) => void;
  setCooldown: (type: string, date: string) => void;
  setPermissionGranted: (v: boolean) => void;
  setPushNotificationsEnabled: (v: boolean) => void;
  unreadCount: () => number;
  reset: () => void;
}

export const useNotificationsStore = create<NotificationsState>()(
  persist(
    (set, get) => ({
      notifications: [],
      lastTransactionDate: null,
      currentStreak: 0,
      lastStreakDate: null,
      cooldowns: {},
      permissionGranted: false,
      pushNotificationsEnabled: true,

      addNotification: (n) => {
        const notification: AppNotification = {
          ...n,
          id: Date.now().toString(),
          receivedAt: new Date().toISOString(),
          read: false,
        };
        set((s) => ({
          notifications: [notification, ...s.notifications].slice(0, 50),
        }));
      },

      markAllRead: () =>
        set((s) => ({
          notifications: s.notifications.map((n) => ({ ...n, read: true })),
        })),

      markRead: (id) =>
        set((s) => ({
          notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
        })),

      clearAll: () => set({ notifications: [] }),

      setLastTransactionDate: (date) => set({ lastTransactionDate: date }),

      updateStreak: (date) => {
        const { lastStreakDate, currentStreak } = get();
        const today = date.slice(0, 10);
        if (!lastStreakDate) {
          set({ currentStreak: 1, lastStreakDate: today });
          return;
        }
        const prev = new Date(lastStreakDate);
        const curr = new Date(today);
        const diffDays = Math.round((curr.getTime() - prev.getTime()) / 86400000);
        if (diffDays === 1) {
          set({ currentStreak: currentStreak + 1, lastStreakDate: today });
        } else if (diffDays > 1) {
          set({ currentStreak: 1, lastStreakDate: today });
        }
      },

      setCooldown: (type, date) =>
        set((s) => ({ cooldowns: { ...s.cooldowns, [type]: date } })),

      setPermissionGranted: (v) => set({ permissionGranted: v }),

      setPushNotificationsEnabled: (v) => set({ pushNotificationsEnabled: v }),

      unreadCount: () => get().notifications.filter((n) => !n.read).length,

      reset: () =>
        set({
          notifications: [],
          lastTransactionDate: null,
          currentStreak: 0,
          lastStreakDate: null,
          cooldowns: {},
        }),
    }),
    {
      name: 'spendly-notifications',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
