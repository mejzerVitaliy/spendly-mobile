import { useEffect, useMemo, useRef } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useWallets } from '@/shared/hooks';
import { useWalletFilterStore } from '@/shared/stores';
import { BottomSheet, type BottomSheetRef } from '@/shared/ui';
import { colors } from '@/shared/theme';
import { useTranslation } from 'react-i18next';

/**
 * Compact pill that opens a sheet to scope Home/Analytics data to one
 * wallet (or back to all of them). The selection is shared across both
 * screens via useWalletFilterStore, not per-screen - picking a wallet on
 * Home is expected to still apply when switching to Analytics.
 */
export function WalletFilterSelector() {
  const sheetRef = useRef<BottomSheetRef>(null);
  const { t } = useTranslation();
  const { wallets, isLoading } = useWallets();
  const { selectedWalletId, setSelectedWalletId } = useWalletFilterStore();

  const selectedWallet = useMemo(
    () => (selectedWalletId ? wallets.find((w) => w.id === selectedWalletId) : undefined),
    [wallets, selectedWalletId],
  );

  // A previously-selected wallet can disappear (archived/deleted elsewhere) -
  // fall back to "all wallets" instead of silently filtering by an id that
  // no longer matches anything.
  useEffect(() => {
    if (!isLoading && selectedWalletId && !selectedWallet) {
      setSelectedWalletId(null);
    }
  }, [isLoading, selectedWalletId, selectedWallet, setSelectedWalletId]);

  if (isLoading || wallets.length <= 1) return null;

  return (
    <>
      <Pressable
        onPress={() => sheetRef.current?.open()}
        className="flex-row items-center gap-1.5 px-3 h-9 rounded-xl border border-border bg-input active:opacity-70"
      >
        <Ionicons name="wallet-outline" size={14} color={colors.mutedForeground} />
        <Text className="text-[13px] font-medium text-foreground" numberOfLines={1} style={{ maxWidth: 100 }}>
          {selectedWallet ? selectedWallet.name : t('walletFilter.allWallets')}
        </Text>
        <Ionicons name="chevron-down" size={14} color={colors.mutedForeground} />
      </Pressable>

      <BottomSheet ref={sheetRef} enableDynamicSizing maxDynamicContentSize={520} noWrapper>
        <BottomSheetScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
          <Text className="text-lg font-bold text-foreground mb-4">{t('walletFilter.title')}</Text>

          <Pressable
            onPress={() => { setSelectedWalletId(null); sheetRef.current?.close(); }}
            className={`flex-row items-center px-4 py-3 rounded-2xl mb-2 border ${!selectedWalletId ? 'bg-primary/10 border-primary/40' : 'bg-input border-border'}`}
          >
            <Text className="flex-1 text-base font-medium text-foreground">{t('walletFilter.allWallets')}</Text>
            {!selectedWalletId && <Ionicons name="checkmark-circle" size={22} color={colors.primary} />}
          </Pressable>

          {wallets.map((wallet) => {
            const isSelected = wallet.id === selectedWalletId;
            return (
              <Pressable
                key={wallet.id}
                onPress={() => { setSelectedWalletId(wallet.id); sheetRef.current?.close(); }}
                className={`flex-row items-center px-4 py-3 rounded-2xl mb-2 border ${isSelected ? 'bg-primary/10 border-primary/40' : 'bg-input border-border'}`}
              >
                <View className="flex-1">
                  <Text className="text-base font-medium text-foreground">{wallet.name}</Text>
                  <Text className="text-xs text-muted-foreground mt-0.5">{wallet.currencyCode}</Text>
                </View>
                {isSelected && <Ionicons name="checkmark-circle" size={22} color={colors.primary} />}
              </Pressable>
            );
          })}
        </BottomSheetScrollView>
      </BottomSheet>
    </>
  );
}
