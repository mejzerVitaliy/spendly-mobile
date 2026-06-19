import { ParsedTransactionPreview } from '@/shared/types';
import { useWallets } from '@/shared/hooks';
import { useCategories } from '@/shared/hooks/categories';
import { formatCompact } from '@/shared/utils';
import { Ionicons } from '@expo/vector-icons';
import { useRef, useEffect } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '@/shared/theme';
import { BottomSheet, type BottomSheetRef } from './bottom-sheet';
import { BottomSheetView } from '@gorhom/bottom-sheet';

interface AIConfirmationDialogProps {
  visible: boolean;
  transactions: ParsedTransactionPreview[];
  isCreating: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

function TransactionPreviewRow({ tx }: { tx: ParsedTransactionPreview }) {
  const { wallets } = useWallets();
  const { getAllQuery } = useCategories();
  const { i18n } = useTranslation();

  const fromWallet = wallets.find(w => w.id === tx.walletId);
  const toWallet = wallets.find(w => w.id === tx.toWalletId);
  const category = getAllQuery.data?.data?.find(c => c.id === tx.categoryId);

  const isTransfer = tx.transactionType === 'TRANSFER';
  const isIncome = tx.transactionType === 'INCOME';

  const iconName = isTransfer ? 'swap-horizontal' : isIncome ? 'arrow-down' : 'arrow-up';
  const iconColor = isTransfer ? '#22D3EE' : isIncome ? '#22C55E' : '#EF4444';
  const amountColor = isTransfer ? colors.foreground : isIncome ? '#22C55E' : '#EF4444';
  const prefix = isTransfer ? '' : isIncome ? '+' : '-';

  const categoryName = category
    ? (i18n.language === 'ru' && (category as any).nameRu ? (category as any).nameRu : category.name)
    : null;

  return (
    <View className="flex-row items-center bg-secondary/50 rounded-2xl p-3 mb-2">
      <View
        className="w-10 h-10 rounded-full items-center justify-center mr-3"
        style={{ backgroundColor: iconColor + '20' }}
      >
        <Ionicons name={iconName} size={18} color={iconColor} />
      </View>

      <View className="flex-1 mr-2">
        <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>
          {tx.description || (isTransfer ? 'Transfer' : categoryName || tx.transactionType)}
        </Text>
        {isTransfer ? (
          <Text className="text-xs text-muted-foreground mt-0.5" numberOfLines={1}>
            {fromWallet?.name ?? '?'} → {toWallet?.name ?? '?'}
          </Text>
        ) : (
          <Text className="text-xs text-muted-foreground mt-0.5" numberOfLines={1}>
            {categoryName ?? tx.transactionType.toLowerCase()}
            {fromWallet ? ` · ${fromWallet.name}` : ''}
          </Text>
        )}
      </View>

      <Text className="text-sm font-bold" style={{ color: amountColor }}>
        {prefix}{formatCompact(tx.amount)} {tx.currencyCode}
      </Text>
    </View>
  );
}

export function AIConfirmationDialog({
  visible,
  transactions,
  isCreating,
  onConfirm,
  onCancel,
}: AIConfirmationDialogProps) {
  const sheetRef = useRef<BottomSheetRef>(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (visible) {
      sheetRef.current?.open();
    } else {
      sheetRef.current?.close();
    }
  }, [visible]);

  if (!visible && transactions.length === 0) return null;

  return (
    <BottomSheet
      ref={sheetRef}
      enableDynamicSizing
      snapPoints={[]}
      onOpenChange={(open) => { if (!open) onCancel(); }}
    >
      <BottomSheetView>
        <View className="px-5 pt-2 pb-8">
          <View className="flex-row items-center gap-2 mb-1">
            <Ionicons name="sparkles" size={18} color={colors.primary} />
            <Text className="text-base font-bold text-foreground">
              {t('aiConfirm.title')}
            </Text>
          </View>
          <Text className="text-sm text-muted-foreground mb-4">
            {t('aiConfirm.subtitle', { count: transactions.length })}
          </Text>

          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 320 }}>
            {transactions.map((tx, i) => (
              <TransactionPreviewRow key={i} tx={tx} />
            ))}
          </ScrollView>

          <View className="flex-row gap-3 mt-4">
            <Pressable
              onPress={onCancel}
              disabled={isCreating}
              className="flex-1 py-3.5 rounded-2xl border border-border items-center active:opacity-70"
            >
              <Text className="text-foreground font-semibold text-sm">
                {t('aiConfirm.reject')}
              </Text>
            </Pressable>

            <Pressable
              onPress={onConfirm}
              disabled={isCreating}
              className={`flex-1 py-3.5 rounded-2xl items-center ${
                isCreating ? 'bg-primary/50' : 'bg-primary active:bg-primary/90'
              }`}
            >
              {isCreating ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text className="text-primary-foreground font-semibold text-sm">
                  {t('aiConfirm.confirm', { count: transactions.length })}
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
}
