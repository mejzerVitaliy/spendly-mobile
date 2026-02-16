import { View, Text } from 'react-native';
import { Button } from '@/shared/ui';

interface WelcomeStepProps {
  onNext: () => void;
  onLogin: () => void;
}

export function WelcomeStep({ onNext, onLogin }: WelcomeStepProps) {
  return (
    <View className="flex-1 justify-center items-center px-8">
      <Text className="text-4xl font-bold text-foreground mb-4">Spendly</Text>
      <Text className="text-lg text-muted-foreground text-center mb-12">
        Track your expenses, manage your finances, and reach your goals.
      </Text>
      <View className="w-full gap-3">
        <Button title="Get Started" size="lg" onPress={onNext} />
        <Button title="I already have an account" size="lg" variant="outline" onPress={onLogin} />
      </View>
    </View>
  );
}
