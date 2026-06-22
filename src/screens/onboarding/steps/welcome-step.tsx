import { View, Text } from 'react-native';
import { Button } from '@/shared/ui';
import { useTranslation } from 'react-i18next';

interface WelcomeStepProps {
  onNext: () => void;
  onLogin: () => void;
}

export function WelcomeStep({ onNext, onLogin }: WelcomeStepProps) {
  const { t } = useTranslation();

  return (
    <View className="flex-1 justify-center items-center px-8">
      <Text className="text-4xl font-bold text-foreground mb-4">Spendly</Text>
      <Text className="text-lg text-muted-foreground text-center mb-12">
        {t('onboarding.tagline')}
      </Text>
      <View className="w-full gap-3">
        <Button title={t('onboarding.getStarted')} size="lg" onPress={onNext} />
        <Button title={t('onboarding.haveAccount')} size="lg" variant="outline" onPress={onLogin} />
      </View>
    </View>
  );
}
