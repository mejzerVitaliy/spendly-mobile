import { View, Text, Alert, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input } from '@/components/ui';
import { useAuth } from '@/hooks/auth';
import { registerSchema, RegisterFormData } from './schemas';
import { router } from 'expo-router';

export function RegisterForm() {
  const { registerMutation } = useAuth();

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
      console.log(error);
      const errorMessage = error?.response?.data?.message || 'Ошибка регистрации';
      Alert.alert('Ошибка', errorMessage);
    }
  };

  return (
    <ScrollView className="w-full">
      <View className="space-y-4">
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-2">Имя</Text>
          <Controller
            control={control}
            name="firstName"
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder="Иван"
                type="text"
                value={value}
                onChangeText={onChange}
                error={errors.firstName?.message}
              />
            )}
          />
        </View>

        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-2">Фамилия</Text>
          <Controller
            control={control}
            name="lastName"
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder="Иванов"
                type="text"
                value={value}
                onChangeText={onChange}
                error={errors.lastName?.message}
              />
            )}
          />
        </View>

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

        <View className="mb-4">
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

        <View className="mb-6">
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Подтвердите пароль
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
          title={registerMutation.isPending ? 'Регистрация...' : 'Зарегистрироваться'}
          onPress={handleSubmit(onSubmit)}
          disabled={registerMutation.isPending}
        />
      </View>
    </ScrollView>
  );
}
