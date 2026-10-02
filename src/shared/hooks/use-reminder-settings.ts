import { notificationsApi } from '@/shared/services/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useReminderSettings = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['notifications', 'reminder-settings'],
    queryFn: async () => (await notificationsApi.getReminderSettings()).data,
  });

  const updateMutation = useMutation({
    mutationKey: ['notifications', 'reminder-settings', 'update'],
    mutationFn: (settings: { enabled: boolean; hourUtc: number; minuteUtc: number }) =>
      notificationsApi.updateReminderSettings(settings),
    onSuccess: (res) => {
      queryClient.setQueryData(['notifications', 'reminder-settings'], res.data);
    },
  });

  return {
    ...query,
    updateMutation,
  };
};
