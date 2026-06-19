import { useAuth } from '@/shared/hooks/auth';
import { Button, Input } from '@/shared/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Text, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { LoginFormData, loginSchema } from './schemas';
import { useTranslation } from 'react-i18next';

export function LoginForm() {
  const { loginMutation } = useAuth();
  const { t } = useTranslation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await loginMutation.mutateAsync(data);
      router.replace('/');
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || t('common.error');
      Toast.show({ type: 'error', text1: t('common.error'), text2: errorMessage });
    }
  };

  return (
    <View className="w-full space-y-4">
      <View className="mb-4">
        <Text className="text-sm font-medium text-foreground mb-2">{t('authLogin.email')}</Text>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value } }) => (
            <Input
              placeholder="example@mail.com"
              type="email"
              value={value}
              onChangeText={onChange}
              error={errors.email?.message}
            />
          )}
        />
      </View>

      <View className="mb-6">
        <Text className="text-sm font-medium text-foreground mb-2">{t('authLogin.password')}</Text>
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

      <Button
        title={loginMutation.isPending ? t('authLogin.loggingIn') : t('authLogin.logIn')}
        onPress={handleSubmit(onSubmit)}
        disabled={loginMutation.isPending}
      />
    </View>
  );
}
