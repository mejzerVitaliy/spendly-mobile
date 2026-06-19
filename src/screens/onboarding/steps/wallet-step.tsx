import { useState } from 'react';
import { View, Text } from 'react-native';
import { Button, Input } from '@/shared/ui';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();

  const handleChangeBalance = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    setBalanceText(cleaned);
    onSetBalance(cleaned ? parseInt(cleaned, 10) : 0);
  };

  return (
    <View className="flex-1 px-6 pt-8">
      <Text className="text-2xl font-bold text-foreground mb-2">
        {t('onboarding.setupWallet')}
      </Text>
      <Text className="text-base text-muted-foreground mb-8">
        {t('onboarding.setupWalletDesc')}
      </Text>

      <Input
        label={t('onboarding.initialBalance')}
        placeholder="0"
        value={balanceText}
        onChangeText={handleChangeBalance}
        type="number"
      />

      <View className="flex-1" />

      <View className="flex-row gap-3 pb-8">
        <View className="flex-1">
          <Button title={t('common.back')} variant="outline" onPress={onBack} disabled={isLoading} />
        </View>
        <View className="flex-1">
          <Button title={t('common.finish')} onPress={onFinish} isLoading={isLoading} />
        </View>
      </View>
    </View>
  );
}
