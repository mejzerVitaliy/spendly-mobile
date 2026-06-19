import { useState } from 'react';
import { Text, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Button, Input, SettingsHeader } from '@/shared/ui';
import { useAuthStore } from '@/shared/stores';
import { authApi } from '@/shared/services/api/auth.api';
import { useTranslation } from 'react-i18next';

export function CreateAccountScreen() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const { t } = useTranslation();

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
      Toast.show({ type: 'error', text1: t('common.error'), text2: t('createAccountScreen.passwordsMismatch') });
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
        error?.response?.data?.message || t('createAccountScreen.somethingWentWrong');
      Toast.show({ type: 'error', text1: t('common.error'), text2: message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background px-5 py-4">
      <SettingsHeader title={t('createAccountScreen.title')} />
      <View className="flex-1">
        <Text className="text-muted-foreground mb-6">
          {t('createAccountScreen.description')}
        </Text>

        <View className="gap-4">
          <Input
            label={t('createAccountScreen.email')}
            placeholder={t('createAccountScreen.emailPlaceholder')}
            value={email}
            onChangeText={setEmail}
            type="email"
          />
          <Input
            label={t('createAccountScreen.password')}
            placeholder={t('createAccountScreen.passwordPlaceholder')}
            value={password}
            onChangeText={setPassword}
            type="password"
          />
          <Input
            label={t('createAccountScreen.confirmPassword')}
            placeholder={t('createAccountScreen.confirmPasswordPlaceholder')}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            type="password"
          />
        </View>

        <View className="mt-auto">
          <Button
            title={t('createAccountScreen.createAccount')}
            onPress={handleSubmit}
            isLoading={isLoading}
            disabled={!isValid}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
