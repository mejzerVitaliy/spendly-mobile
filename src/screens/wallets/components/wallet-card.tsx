import { WalletDto } from '@/shared/types';
import { Pressable, Text, View } from 'react-native';

interface WalletCardProps {
  wallet: WalletDto;
  typeLabel: string;
  isArchived?: boolean;
  onSetDefault?: () => void;
  onArchive?: () => void;
}

export function WalletCard({
  wallet,
  typeLabel,
  isArchived,
  onSetDefault,
  onArchive,
}: WalletCardProps) {
  const formattedBalance = (wallet.currentBalance / 100).toFixed(2);
  const hasConvertedBalance = wallet.convertedBalance !== undefined && wallet.mainCurrencyCode;
  const formattedConvertedBalance = hasConvertedBalance 
    ? (wallet.convertedBalance! / 100).toFixed(2) 
    : null;

  return (
    <View
      className={`bg-card rounded-xl p-4 mb-3 border ${
        wallet.isDefault ? 'border-primary' : 'border-border'
      } ${isArchived ? 'opacity-60' : ''}`}
    >
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <Text className="text-lg font-semibold text-foreground">{wallet.name}</Text>
            {wallet.isDefault && (
              <View className="bg-primary/20 px-2 py-0.5 rounded">
                <Text className="text-primary text-xs font-medium">Default</Text>
              </View>
            )}
          </View>
          <Text className="text-muted-foreground text-sm">{typeLabel}</Text>
        </View>
        <View className="items-end">
          <Text className="text-xl font-bold text-foreground">
            {wallet.currencyCode} {formattedBalance}
          </Text>
          {hasConvertedBalance && wallet.currencyCode !== wallet.mainCurrencyCode && (
            <Text className="text-sm text-muted-foreground mt-1">
              ≈ {wallet.mainCurrencyCode} {formattedConvertedBalance}
            </Text>
          )}
        </View>
      </View>

      {!isArchived && (
        <View className="flex-row gap-2 mt-3 pt-3 border-t border-border">
          {!wallet.isDefault && onSetDefault && (
            <Pressable
              onPress={onSetDefault}
              className="flex-1 bg-secondary py-2 rounded-lg items-center"
            >
              <Text className="text-secondary-foreground text-sm font-medium">Set Default</Text>
            </Pressable>
          )}
          {!wallet.isDefault && onArchive && (
            <Pressable
              onPress={onArchive}
              className="flex-1 bg-destructive/10 py-2 rounded-lg items-center"
            >
              <Text className="text-destructive text-sm font-medium">Archive</Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}
