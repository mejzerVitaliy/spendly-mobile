import { usageApi } from '@/shared/services/api';
import { useQuery } from '@tanstack/react-query';

export const useAiUsage = () => {
  const query = useQuery({
    queryKey: ['usage', 'current'],
    queryFn: usageApi.getCurrent,
    staleTime: 0,
  });

  const data = query.data;

  return {
    ...query,
    isTransactionLimitReached: data ? data.transactions.used >= data.transactions.limit : false,
    isInsightLimitReached: data ? data.insights.used >= data.insights.limit : false,
  };
};
