import { useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Button, Input, SettingsHeader } from '@/shared/ui';
import { useAuthStore } from '@/shared/stores';
import { authApi } from '@/shared/services/api/auth.api';

export function CreateAccountScreen() {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isValid =
    email.trim().length > 0 &&
    password.length >= 6 &&
    password === confirmPassword;

  const handleSubmit = async () => {
    if (!isValid) return;

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authApi.upgradeGuest({
        email: email.trim(),
        password,
      });

      const { user, accessToken, refreshToken } = response.data;
      await setAuth(user, accessToken, refreshToken);
      router.back();
    } catch (error: any) {
      const message =
        error?.response?.data?.message || 'Something went wrong. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <SettingsHeader title="Create Account" />
      <ScrollView className="flex-1 px-5" keyboardShouldPersistTaps="handled">
        <Text className="text-muted-foreground mb-6">
          Link your account with email and password to access it from any device.
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
            placeholder="At least 6 characters"
            value={password}
            onChangeText={setPassword}
            type="password"
          />
          <Input
            label="Confirm Password"
            placeholder="Repeat your password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            type="password"
          />
        </View>

        <View className="mt-8">
          <Button
            title="Create Account"
            onPress={handleSubmit}
            isLoading={isLoading}
            disabled={!isValid}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
