import { useAuth } from '@/shared/hooks/auth';
import { Button, Input } from '@/shared/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Alert, ScrollView, Text, View } from 'react-native';
import { RegisterFormData, registerSchema } from './schemas';

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
      const errorMessage = error?.response?.data?.message || 'Error';
      Alert.alert('Error', errorMessage);
    }
  };

  return (
    <ScrollView className="w-full">
      <View className="space-y-4">
        <View className="mb-4">
          <Text className="text-sm font-medium text-foreground mb-2">First Name</Text>
          <Controller
            control={control}
            name="firstName"
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder="Type your name"
                type="text"
                value={value}
                onChangeText={onChange}
                error={errors.firstName?.message}
              />
            )}
          />
        </View>

        <View className="mb-4">
          <Text className="text-sm font-medium text-foreground mb-2">Last Name</Text>
          <Controller
            control={control}
            name="lastName"
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder="Type your last name"
                type="text"
                value={value}
                onChangeText={onChange}
                error={errors.lastName?.message}
              />
            )}
          />
        </View>

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

        <View className="mb-4">
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

        <View className="mb-6">
          <Text className="text-sm font-medium text-foreground mb-2">
            Confirm Password
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
          title={registerMutation.isPending ? 'Registering...' : 'Register'}
          onPress={handleSubmit(onSubmit)}
          disabled={registerMutation.isPending}
        />
      </View>
    </ScrollView>
  );
}
