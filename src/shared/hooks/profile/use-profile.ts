import { profileApi } from '@/shared/services/api';
import {
  ChangePasswordRequest,
  UpdateEmailRequest,
  UpdateSettingsRequest,
} from '@/shared/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/shared/stores';

const useProfile = () => {
  const queryClient = useQueryClient();
  const { clearAuth } = useAuthStore();

  const updateSettingsMutation = useMutation({
    mutationKey: ['profile', 'settings', 'update'],
    mutationFn: (request: UpdateSettingsRequest) => profileApi.updateSettings(request),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['user'], refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: ['wallets'], refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: ['transactions'], refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: ['reports'], refetchType: 'all' }),
      ]);
    },
  });

  const updateEmailMutation = useMutation({
    mutationKey: ['profile', 'email', 'update'],
    mutationFn: (request: UpdateEmailRequest) => profileApi.updateEmail(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'], refetchType: 'all' });
    },
  });

  const changePasswordMutation = useMutation({
    mutationKey: ['profile', 'password', 'change'],
    mutationFn: (request: ChangePasswordRequest) => profileApi.changePassword(request),
  });

  const deleteAccountMutation = useMutation({
    mutationKey: ['profile', 'delete'],
    mutationFn: () => profileApi.deleteAccount(),
    onSuccess: async () => {
      queryClient.clear();
      await clearAuth();
    },
  });

  return {
    updateSettingsMutation,
    updateEmailMutation,
    changePasswordMutation,
    deleteAccountMutation,
  };
};

export { useProfile };
