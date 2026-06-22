import { useAuth } from '@/shared/hooks/auth';
import { Button, Input } from '@/shared/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Text, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';
import { ResetPasswordFormData, resetPasswordSchema } from './schemas';

interface ResetPasswordFormProps {
  token: string;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const { resetPasswordMutation } = useAuth();
  const { t } = useTranslation();
  const [done, setDone] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      await resetPasswordMutation.mutateAsync({ token, password: data.password });
      setDone(true);
    } catch (error: any) {
      const msg = error?.response?.data?.message;
      const isTokenError = msg?.toLowerCase().includes('invalid') || msg?.toLowerCase().includes('expired');
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: isTokenError ? t('resetPassword.invalidToken') : t('common.error'),
      });
    }
  };

  if (done) {
    return (
      <View className="w-full items-center">
        <View className="w-16 h-16 rounded-full bg-primary/10 items-center justify-center mb-6">
          <Text className="text-3xl">✅</Text>
        </View>
        <Text className="text-xl font-bold text-foreground mb-2 text-center">
          {t('resetPassword.successTitle')}
        </Text>
        <Text className="text-sm text-muted-foreground text-center mb-8 leading-5">
          {t('resetPassword.successMessage')}
        </Text>
        <TouchableOpacity onPress={() => router.replace('/login')}>
          <Text className="text-primary font-semibold text-base">
            {t('resetPassword.backToLogin')}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="w-full">
      <View className="mb-4">
        <Text className="text-sm font-medium text-foreground mb-2">
          {t('resetPassword.newPassword')}
        </Text>
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, value } }) => (
            <Input
              placeholder="••••••••"
              type="password"
              value={value}
              onChangeText={onChange}
              error={errors.password?.message}
            />
          )}
        />
      </View>

      <View className="mb-6">
        <Text className="text-sm font-medium text-foreground mb-2">
          {t('resetPassword.confirmPassword')}
        </Text>
        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, value } }) => (
            <Input
              placeholder="••••••••"
              type="password"
              value={value}
              onChangeText={onChange}
              error={errors.confirmPassword?.message}
            />
          )}
        />
      </View>

      <Button
        title={
          resetPasswordMutation.isPending
            ? t('resetPassword.resetting')
            : t('resetPassword.reset')
        }
        onPress={handleSubmit(onSubmit)}
        disabled={resetPasswordMutation.isPending}
      />

      <TouchableOpacity
        className="mt-6 items-center"
        onPress={() => router.replace('/login')}
      >
        <Text className="text-muted-foreground text-sm">
          {t('resetPassword.backToLogin')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
