import { useEffect, useState } from 'react';
import { getIsOnline, subscribeToNetworkState } from '@/shared/lib/network-state';

export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(getIsOnline());

  useEffect(() => {
    const unsubscribe = subscribeToNetworkState(setIsOnline);
    return () => {
      unsubscribe();
    };
  }, []);

  return { isOnline };
};
