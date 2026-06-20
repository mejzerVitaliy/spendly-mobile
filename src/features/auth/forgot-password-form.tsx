import { useAuth } from '@/shared/hooks/auth';
import { Button, Input } from '@/shared/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Text, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';
import { ForgotPasswordFormData, forgotPasswordSchema } from './schemas';

export function ForgotPasswordForm() {
  const { forgotPasswordMutation } = useAuth();
  const { t } = useTranslation();
  const [sent, setSent] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await forgotPasswordMutation.mutateAsync(data);
      setSent(true);
    } catch {
      Toast.show({ type: 'error', text1: t('common.error'), text2: t('common.error') });
    }
  };

  if (sent) {
    return (
      <View className="w-full items-center">
        <View className="w-16 h-16 rounded-full bg-primary/10 items-center justify-center mb-6">
          <Text className="text-3xl">📬</Text>
        </View>
        <Text className="text-xl font-bold text-foreground mb-2 text-center">
          {t('forgotPassword.successTitle')}
        </Text>
        <Text className="text-sm text-muted-foreground text-center mb-8 leading-5">
          {t('forgotPassword.successMessage')}
        </Text>
        <TouchableOpacity onPress={() => router.replace('/login')}>
          <Text className="text-primary font-semibold text-base">
            {t('forgotPassword.backToLogin')}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="w-full">
      <View className="mb-6">
        <Text className="text-sm font-medium text-foreground mb-2">
          {t('forgotPassword.email')}
        </Text>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value } }) => (
            <Input
              placeholder={t('forgotPassword.emailPlaceholder')}
              type="email"
              value={value}
              onChangeText={onChange}
              error={errors.email?.message}
            />
          )}
        />
      </View>

      <Button
        title={
          forgotPasswordMutation.isPending
            ? t('forgotPassword.sending')
            : t('forgotPassword.sendLink')
        }
        onPress={handleSubmit(onSubmit)}
        disabled={forgotPasswordMutation.isPending}
      />

      <TouchableOpacity
        className="mt-6 items-center"
        onPress={() => router.back()}
      >
        <Text className="text-muted-foreground text-sm">
          {t('forgotPassword.backToLogin')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
