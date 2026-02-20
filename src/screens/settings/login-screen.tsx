import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Button, Input, SettingsHeader } from '@/shared/ui';
import { useAuthStore } from '@/shared/stores';
import { authApi } from '@/shared/services/api/auth.api';

export function LoginScreen() {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isValid = email.trim().length > 0 && password.length >= 6;

  const handleSubmit = async () => {
    if (!isValid) return;

    setIsLoading(true);
    try {
      const response = await authApi.login({
        email: email.trim(),
        password,
      });

      const { user, accessToken, refreshToken } = response.data;
      await setAuth(user, accessToken, refreshToken);
      router.replace('/(tabs)' as any);
    } catch (error: any) {
      const message =
        error?.response?.data?.message || 'Invalid email or password.';
      Toast.show({ type: 'error', text1: 'Error', text2: message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <SettingsHeader title="Login" />
      <ScrollView className="flex-1 px-5" keyboardShouldPersistTaps="handled">
        <Text className="text-muted-foreground mb-6">
          Login with your existing account to restore your data.
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

        <View className="mt-8">
          <Button
            title="Login"
            onPress={handleSubmit}
            isLoading={isLoading}
            disabled={!isValid}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
