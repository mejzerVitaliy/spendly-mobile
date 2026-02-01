import { useState } from 'react';
import { ScrollView, Text, View, Pressable, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWallets } from '@/shared/hooks';
import { WalletDto, WalletType } from '@/shared/types';
import { CreateWalletModal } from './components/create-wallet-modal';
import { WalletCard } from './components/wallet-card';

const WALLET_TYPE_LABELS: Record<WalletType, string> = {
  CASH: 'Cash',
  DEBIT_CARD: 'Debit Card',
  CREDIT_CARD: 'Credit Card',
  SAVINGS: 'Savings',
  CUSTOM: 'Custom',
};

export function WalletsScreen() {
  const [showArchived, setShowArchived] = useState(false);
  const { wallets, totalBalance, isLoading, setDefaultMutation, archiveMutation, refetch } = useWallets(showArchived);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);

  const handleSetDefault = async (wallet: WalletDto) => {
    if (wallet.isDefault) return;
    
    try {
      await setDefaultMutation.mutateAsync({ walletId: wallet.id });
    } catch {
      Alert.alert('Error', 'Failed to set default wallet');
    }
  };

  const handleArchive = async (wallet: WalletDto) => {
    if (wallet.isDefault) {
      Alert.alert('Error', 'Cannot archive default wallet. Set another wallet as default first.');
      return;
    }

    Alert.alert(
      'Archive Wallet',
      `Are you sure you want to archive "${wallet.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Archive',
          style: 'destructive',
          onPress: async () => {
            try {
              await archiveMutation.mutateAsync(wallet.id);
            } catch {
              Alert.alert('Error', 'Failed to archive wallet');
            }
          },
        },
      ]
    );
  };

  const activeWallets = wallets.filter((w) => !w.isArchived);
  const archivedWallets = wallets.filter((w) => w.isArchived);

  const displayBalance = totalBalance?.totalBalance ?? 0;
  const mainCurrency = wallets[0]?.mainCurrencyCode || 'USD';

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
      >
        <View className="px-5 pt-4">
          <Text className="text-3xl font-bold text-foreground mb-2">Wallets</Text>
          <Text className="text-muted-foreground mb-6">Manage your wallets</Text>

          <View className="bg-card rounded-2xl p-5 mb-6 border border-border">
            <Text className="text-muted-foreground text-sm mb-1">Total Balance</Text>
            <Text className="text-3xl font-bold text-foreground">
              {mainCurrency} {(displayBalance / 100).toFixed(2)}
            </Text>
            <Text className="text-muted-foreground text-sm mt-1">
              {activeWallets.length} active wallet{activeWallets.length !== 1 ? 's' : ''}
            </Text>
          </View>

          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-semibold text-foreground">Your Wallets</Text>
            <Pressable
              onPress={() => setIsCreateModalVisible(true)}
              className="bg-primary px-4 py-2 rounded-lg"
            >
              <Text className="text-primary-foreground font-medium">+ Add</Text>
            </Pressable>
          </View>

          {activeWallets.length === 0 ? (
            <View className="bg-card rounded-xl p-6 items-center border border-border">
              <Text className="text-muted-foreground text-center">
                No wallets yet. Create your first wallet!
              </Text>
            </View>
          ) : (
            activeWallets.map((wallet) => (
              <WalletCard
                key={wallet.id}
                wallet={wallet}
                typeLabel={WALLET_TYPE_LABELS[wallet.type]}
                onSetDefault={() => handleSetDefault(wallet)}
                onArchive={() => handleArchive(wallet)}
              />
            ))
          )}

          {archivedWallets.length > 0 && (
            <View className="mt-6">
              <Pressable
                onPress={() => setShowArchived(!showArchived)}
                className="flex-row items-center mb-4"
              >
                <Text className="text-muted-foreground">
                  {showArchived ? '▼' : '▶'} Archived ({archivedWallets.length})
                </Text>
              </Pressable>

              {showArchived &&
                archivedWallets.map((wallet) => (
                  <WalletCard
                    key={wallet.id}
                    wallet={wallet}
                    typeLabel={WALLET_TYPE_LABELS[wallet.type]}
                    isArchived
                  />
                ))}
            </View>
          )}

          <View className="h-20" />
        </View>
      </ScrollView>

      <CreateWalletModal
        visible={isCreateModalVisible}
        onClose={() => setIsCreateModalVisible(false)}
      />
    </SafeAreaView>
  );
}
