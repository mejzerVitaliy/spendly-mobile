import { View, Text, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input } from '@/components/ui';
import { useAuth } from '@/hooks/auth';
import { loginSchema, LoginFormData } from './schemas';
import { router } from 'expo-router';

export function LoginForm() {
  const { loginMutation } = useAuth();

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
      const errorMessage = error?.response?.data?.message || 'Ошибка входа';
      Alert.alert('Ошибка', errorMessage);
    }
  };

  return (
    <View className="w-full space-y-4">
      <View className="mb-4">
        <Text className="text-sm font-medium text-gray-700 mb-2">Email</Text>
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
        <Text className="text-sm font-medium text-gray-700 mb-2">Пароль</Text>
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
        title={loginMutation.isPending ? 'Вход...' : 'Войти'}
        onPress={handleSubmit(onSubmit)}
        disabled={loginMutation.isPending}
      />
    </View>
  );
}
