import { ResetPasswordForm } from '@/features/auth';
import { useLocalSearchParams } from 'expo-router';
import { KeyboardAvoidingView, Platform, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

export default function ResetPasswordScreen() {
  const { t } = useTranslation();
  const { token } = useLocalSearchParams<{ token: string }>();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 justify-center px-6">
          <View className="mb-8">
            <Text className="text-3xl font-bold text-foreground mb-2">
              {t('resetPassword.title')}
            </Text>
            <Text className="text-muted-foreground leading-5">
              {t('resetPassword.subtitle')}
            </Text>
          </View>

          <ResetPasswordForm token={token ?? ''} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
