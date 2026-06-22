import { transactionsApi } from '@/shared/services/api';
import { notificationService } from '@/shared/services/notifications';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

export function useRecurringSync() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const sync = useCallback(async () => {
    try {
      const res = await transactionsApi.getRecurringProcessedToday();
      const count = res?.data?.count ?? 0;
      if (count === 0) return;

      // Invalidate queries so new transactions appear in the list
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['transactions'], exact: false, refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: ['reports'], exact: false, refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: ['wallets'], exact: false, refetchType: 'all' }),
      ]);

      // Show in-app notification
      await notificationService.sendRecurringDueNotification(t as any, count);
    } catch {
      // network or auth error — silently skip
    }
  }, [queryClient, t]);

  return { sync };
}
