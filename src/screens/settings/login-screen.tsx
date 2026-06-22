import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Button, Input, SettingsHeader } from '@/shared/ui';
import { useAuthStore } from '@/shared/stores';
import { authApi } from '@/shared/services/api/auth.api';
import { useTranslation } from 'react-i18next';

export function LoginScreen() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const { t } = useTranslation();

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
        error?.response?.data?.message || t('loginScreen.invalidCredentials');
      Toast.show({ type: 'error', text1: t('common.error'), text2: message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background px-5 py-4">
      <SettingsHeader title={t('loginScreen.title')} />
      <View className="flex-1">
        <Text className="text-muted-foreground mb-6">
          {t('loginScreen.description')}
        </Text>

        <View className="gap-4">
          <Input
            label={t('loginScreen.email')}
            placeholder={t('loginScreen.emailPlaceholder')}
            value={email}
            onChangeText={setEmail}
            type="email"
          />
          <Input
            label={t('loginScreen.password')}
            placeholder={t('loginScreen.passwordPlaceholder')}
            value={password}
            onChangeText={setPassword}
            type="password"
          />
          <TouchableOpacity
            className="items-end"
            onPress={() => router.push('/forgot-password')}
          >
            <Text className="text-primary text-sm font-medium">
              {t('authLogin.forgotPassword')}
            </Text>
          </TouchableOpacity>
        </View>

        <View className="mt-auto">
          <Button
            title={t('loginScreen.login')}
            onPress={handleSubmit}
            isLoading={isLoading}
            disabled={!isValid}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
