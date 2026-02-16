import { useState } from 'react';
import { View, Text } from 'react-native';
import { Button, Input } from '@/shared/ui';

interface WalletStepProps {
  initialBalance: number;
  onSetBalance: (balance: number) => void;
  onFinish: () => void;
  onBack: () => void;
  isLoading: boolean;
}

export function WalletStep({ initialBalance, onSetBalance, onFinish, onBack, isLoading }: WalletStepProps) {
  const [balanceText, setBalanceText] = useState(
    initialBalance > 0 ? String(initialBalance) : '',
  );

  const handleChangeBalance = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    setBalanceText(cleaned);
    onSetBalance(cleaned ? parseInt(cleaned, 10) : 0);
  };

  return (
    <View className="flex-1 px-6 pt-8">
      <Text className="text-2xl font-bold text-foreground mb-2">
        Set up your wallet
      </Text>
      <Text className="text-base text-muted-foreground mb-8">
        We&apos;ll create a default wallet for you. You can set your current balance.
      </Text>

      <Input
        label="Initial Balance"
        placeholder="0"
        value={balanceText}
        onChangeText={handleChangeBalance}
        type="number"
      />

      <View className="flex-1" />

      <View className="flex-row gap-3 pb-8">
        <View className="flex-1">
          <Button title="Back" variant="outline" onPress={onBack} disabled={isLoading} />
        </View>
        <View className="flex-1">
          <Button title="Finish" onPress={onFinish} isLoading={isLoading} />
        </View>
      </View>
    </View>
  );
}
