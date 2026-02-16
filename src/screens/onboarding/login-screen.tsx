import { useState } from 'react';
import { Alert, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Button, Input } from '@/shared/ui';
import { useAuthStore } from '@/shared/stores';
import { authApi } from '@/shared/services/api/auth.api';

export function OnboardingLoginScreen() {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isValid = email.trim().length > 0 && password.length >= 6;

  const handleLogin = async () => {
    if (!isValid) return;

    setIsLoading(true);
    try {
      const response = await authApi.login({
        email: email.trim(),
        password,
      });

      const { user, accessToken, refreshToken } = response.data;
      await setAuth(user, accessToken, refreshToken);
    } catch (error: any) {
      const message =
        error?.response?.data?.message || 'Invalid email or password.';
      Alert.alert('Error', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-6 pt-8">
        <Text className="text-2xl font-bold text-foreground mb-2">
          Welcome back
        </Text>
        <Text className="text-base text-muted-foreground mb-8">
          Login with your existing account
        </Text>

        <View className="gap-4">
          <Input
            label="Email"
            placeholder="john@example.com"
            value={email}
            onChangeText={setEmail}
            type="email"
          />
          <Input
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            type="password"
          />
        </View>

        <View className="flex-1" />

        <View className="gap-3 pb-8">
          <Button
            title="Login"
            onPress={handleLogin}
            isLoading={isLoading}
            disabled={!isValid}
          />
          <Button
            title="Back"
            variant="outline"
            onPress={() => router.back()}
            disabled={isLoading}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
