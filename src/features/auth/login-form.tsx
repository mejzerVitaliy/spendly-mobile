import { useAuth } from '@/shared/hooks/auth';
import { Button, Input } from '@/shared/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Text, View } from 'react-native';
import { LoginFormData, loginSchema } from './schemas';

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
      const errorMessage = error?.response?.data?.message || 'Error';
      Alert.alert('Error', errorMessage);
    }
  };

  return (
    <View className="w-full space-y-4">
      <View className="mb-4">
        <Text className="text-sm font-medium text-foreground mb-2">Email</Text>
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
        <Text className="text-sm font-medium text-foreground mb-2">Password</Text>
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
        title={loginMutation.isPending ? 'Logging in...' : 'Log in'}
        onPress={handleSubmit(onSubmit)}
        disabled={loginMutation.isPending}
      />
    </View>
  );
}
