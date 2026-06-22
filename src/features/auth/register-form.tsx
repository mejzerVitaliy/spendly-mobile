import { useAuth } from '@/shared/hooks/auth';
import { Button, Input } from '@/shared/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, Text, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { RegisterFormData, registerSchema } from './schemas';
import { useTranslation } from 'react-i18next';

export function RegisterForm() {
  const { registerMutation } = useAuth();
  const { t } = useTranslation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const { confirmPassword, ...registerData } = data;
      await registerMutation.mutateAsync(registerData);
      router.replace('/');
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || t('common.error');
      Toast.show({ type: 'error', text1: t('common.error'), text2: errorMessage });
    }
  };

  return (
    <ScrollView className="w-full">
      <View className="space-y-4">
        <View className="mb-4">
          <Text className="text-sm font-medium text-foreground mb-2">{t('authRegister.firstName')}</Text>
          <Controller
            control={control}
            name="firstName"
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder={t('authRegister.firstNamePlaceholder')}
                type="text"
                value={value}
                onChangeText={onChange}
                error={errors.firstName?.message}
              />
            )}
          />
        </View>

        <View className="mb-4">
          <Text className="text-sm font-medium text-foreground mb-2">{t('authRegister.lastName')}</Text>
          <Controller
            control={control}
            name="lastName"
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder={t('authRegister.lastNamePlaceholder')}
                type="text"
                value={value}
                onChangeText={onChange}
                error={errors.lastName?.message}
              />
            )}
          />
        </View>

        <View className="mb-4">
          <Text className="text-sm font-medium text-foreground mb-2">{t('authRegister.email')}</Text>
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

        <View className="mb-4">
          <Text className="text-sm font-medium text-foreground mb-2">{t('authRegister.password')}</Text>
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
            {t('authRegister.confirmPassword')}
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
          title={registerMutation.isPending ? t('authRegister.registering') : t('authRegister.register')}
          onPress={handleSubmit(onSubmit)}
          disabled={registerMutation.isPending}
        />
      </View>
    </ScrollView>
  );
}
