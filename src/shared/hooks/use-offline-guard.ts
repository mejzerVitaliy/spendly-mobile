import { useNetworkStatus } from './use-network-status';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';
import { useCallback } from 'react';

export const useOfflineGuard = () => {
  const { isOnline } = useNetworkStatus();
  const { t } = useTranslation();

  const guard = useCallback(
    <T extends unknown[]>(fn: (...args: T) => void) =>
      (...args: T) => {
        if (!isOnline) {
          Toast.show({
            type: 'error',
            text1: t('offline.actionTitle'),
            text2: t('offline.actionBody'),
          });
          return;
        }
        fn(...args);
      },
    [isOnline, t],
  );

  return { guard, isOnline };
};
