import { ForgotPasswordForm } from '@/features/auth';
import { KeyboardAvoidingView, Platform, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

export default function ForgotPasswordScreen() {
  const { t } = useTranslation();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 justify-center px-6">
          <View className="mb-8">
            <Text className="text-3xl font-bold text-foreground mb-2">
              {t('forgotPassword.title')}
            </Text>
            <Text className="text-muted-foreground leading-5">
              {t('forgotPassword.subtitle')}
            </Text>
          </View>

          <ForgotPasswordForm />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
