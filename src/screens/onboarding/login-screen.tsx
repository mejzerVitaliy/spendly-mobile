import { useState } from 'react';
import { View, Text } from 'react-native';
import Toast from 'react-native-toast-message';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Button, Input } from '@/shared/ui';
import { useAuthStore } from '@/shared/stores';
import { authApi } from '@/shared/services/api/auth.api';
import { useTranslation } from 'react-i18next';

export function OnboardingLoginScreen() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const { t } = useTranslation();

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
        error?.response?.data?.message || t('onboardingLogin.invalidCredentials');
      Toast.show({ type: 'error', text1: t('common.error'), text2: message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-6 pt-8">
        <Text className="text-3xl font-bold text-foreground mb-2">
          {t('onboardingLogin.welcomeBack')}
        </Text>
        <Text className="text-base text-muted-foreground mb-8">
          {t('onboardingLogin.subtitle')}
        </Text>

        <View className="gap-4">
          <Input
            label={t('onboardingLogin.email')}
            placeholder={t('onboardingLogin.emailPlaceholder')}
            value={email}
            onChangeText={setEmail}
            type="email"
          />
          <Input
            label={t('onboardingLogin.password')}
            placeholder={t('onboardingLogin.passwordPlaceholder')}
            value={password}
            onChangeText={setPassword}
            type="password"
          />
        </View>

        <View className="flex-1" />

        <View className="gap-3 pb-8">
          <Button
            title={t('onboardingLogin.login')}
            onPress={handleLogin}
            isLoading={isLoading}
            disabled={!isValid}
          />
          <Button
            title={t('onboardingLogin.back')}
            variant="outline"
            onPress={() => router.back()}
            disabled={isLoading}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
