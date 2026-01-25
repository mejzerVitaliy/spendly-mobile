import { profileApi } from '@/shared/services/api';
import { UpdateSettingsRequest } from '@/shared/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const useProfile = () => {
  const queryClient = useQueryClient();

  const updateSettingsMutation = useMutation({
    mutationKey: ['profile', 'settings', 'update'],
    mutationFn: (request: UpdateSettingsRequest) =>
      profileApi.updateSettings(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });

  return {
    updateSettingsMutation,
  };
};

export { useProfile };
