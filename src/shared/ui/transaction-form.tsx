import { TransactionType } from '@/shared/constants';
import { useAuth, useTransactions, useGetTransactionById, useWallets } from '@/shared/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { colors } from '@/shared/theme';
import { ConfirmDialog } from './confirm-dialog';
import { z } from 'zod';
import { FormCategoryPicker } from './form-category-picker';
import { FormCurrencyPicker } from './form-currency-picker';
import { FormDatePicker } from './form-date-picker';
import { FormInput } from './form-input';
import { FormSwitch } from './form-switch';
import { FormWalletPicker } from './form-wallet-picker';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheet, type BottomSheetRef } from './bottom-sheet';
import { BottomSheetView } from '@gorhom/bottom-sheet';
import { currencyApi } from '@/shared/services/api';
import { useQuery } from '@tanstack/react-query';

// Unified schema — superRefine enforces per-type rules
const transactionSchema = z.object({
  type: z.nativeEnum(TransactionType),
  amount: z.coerce.number().positive(),
  date: z.string().datetime(),
  description: z.string().optional(),
  // INCOME / EXPENSE fields
  currencyCode: z.string().length(3).optional(),
  categoryId: z.string().uuid().optional(),
  walletId: z.string().uuid().optional(),
  // TRANSFER fields
  fromWalletId: z.string().uuid().optional(),
  toWalletId: z.string().uuid().optional(),
}).superRefine((data, ctx) => {
  if (data.type === TransactionType.TRANSFER) {
    if (!data.fromWalletId) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['fromWalletId'], message: 'Required' });
    }
    if (!data.toWalletId) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['toWalletId'], message: 'Required' });
    }
    if (data.fromWalletId && data.toWalletId && data.fromWalletId === data.toWalletId) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['toWalletId'], message: 'sameWallet' });
    }
  } else {
    if (!data.currencyCode || data.currencyCode.length !== 3) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['currencyCode'], message: 'Required' });
    }
    if (!data.categoryId) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['categoryId'], message: 'Required' });
    }
  }
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface TransactionFormProps {
  mode: 'create' | 'edit';
  transactionId?: string;
  onSuccess?: () => void;
}

export function TransactionForm({ mode, transactionId, onSuccess }: TransactionFormProps) {
  const { createMutation, createTransferMutation, updateMutation, removeMutation } = useTransactions();
  const { getMeQuery } = useAuth();
  const { wallets } = useWallets();
  const actionSheetRef = useRef<BottomSheetRef>(null);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const { t } = useTranslation();

  const userMainCurrency = getMeQuery.data?.data?.mainCurrencyCode || 'USD';

  const { data: transactionData, isLoading: isLoadingTransaction, isError } =
    useGetTransactionById(mode === 'edit' && transactionId ? transactionId : '');

  const transaction = transactionData?.data;

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      date: new Date().toISOString(),
      currencyCode: userMainCurrency,
      type: TransactionType.EXPENSE,
      categoryId: '',
      description: '',
    },
  });

  const transactionType = watch('type');
  const fromWalletId = watch('fromWalletId');
  const toWalletId = watch('toWalletId');
  const amount = watch('amount');

  // Look up wallet details for currency info
  const fromWallet = wallets.find(w => w.id === fromWalletId);
  const toWallet = wallets.find(w => w.id === toWalletId);
  const fromCurrency = fromWallet?.currencyCode;
  const toCurrency = toWallet?.currencyCode;
  const needsConversion = !!(fromCurrency && toCurrency && fromCurrency !== toCurrency);

  // Fetch exchange rate for preview when currencies differ
  const rateQuery = useQuery({
    queryKey: ['currency-rate', fromCurrency, toCurrency],
    queryFn: () => currencyApi.getRate(fromCurrency!, toCurrency!),
    enabled: needsConversion,
    staleTime: 5 * 60 * 1000,
  });

  const exchangeRate = rateQuery.data?.data?.rate;
  const estimatedReceiveAmount = exchangeRate && amount ? (amount * exchangeRate).toFixed(2) : null;

  useEffect(() => {
    if (mode === 'edit' && transaction) {
      const txType = transaction.transferGroupId
        ? TransactionType.EXPENSE // transfers show as their underlying type in edit
        : (transaction.type as TransactionType);

      reset({
        amount: transaction.amount / 100,
        date: transaction.date,
        currencyCode: transaction.currencyCode,
        type: txType,
        categoryId: transaction.categoryId || '',
        description: transaction.description || '',
        walletId: transaction.walletId,
      });
    }
  }, [transaction, reset, mode]);

  useEffect(() => {
    if (mode === 'create') {
      setValue('categoryId', '');
    }
  }, [transactionType, mode, setValue]);

  // Reset transfer wallet fields when switching to non-transfer
  useEffect(() => {
    if (transactionType !== TransactionType.TRANSFER) {
      setValue('fromWalletId', undefined);
      setValue('toWalletId', undefined);
    } else {
      setValue('walletId', undefined);
      setValue('currencyCode', undefined);
      setValue('categoryId', undefined);
    }
  }, [transactionType, setValue]);

  const TRANSACTION_TYPE_OPTIONS = [
    { label: t('transaction.income'), value: TransactionType.INCOME },
    { label: t('transaction.expense'), value: TransactionType.EXPENSE },
    { label: t('transaction.transfer'), value: TransactionType.TRANSFER },
  ];

  const onSubmit = async (data: TransactionFormData) => {
    try {
      if (data.type === TransactionType.TRANSFER) {
        await createTransferMutation.mutateAsync({
          fromWalletId: data.fromWalletId!,
          toWalletId: data.toWalletId!,
          fromAmount: Math.round(data.amount * 100),
          date: data.date,
          description: data.description,
        });
        Toast.show({ type: 'success', text1: t('transaction.transferCreated'), text2: t('transaction.transferCreatedDesc') });
        reset();
      } else if (mode === 'create') {
        await createMutation.mutateAsync({
          amount: Math.round(data.amount * 100),
          date: data.date,
          currencyCode: data.currencyCode!,
          type: data.type,
          categoryId: data.categoryId!,
          description: data.description,
          walletId: data.walletId,
        });
        Toast.show({ type: 'success', text1: t('transaction.created'), text2: t('transaction.createdDesc') });
        reset();
      } else if (mode === 'edit' && transaction) {
        await updateMutation.mutateAsync({
          id: transaction.id,
          request: {
            amount: Math.round(data.amount * 100),
            date: data.date,
            currencyCode: data.currencyCode!,
            type: data.type,
            categoryId: data.categoryId!,
            description: data.description,
            walletId: data.walletId,
          },
        });
        Toast.show({ type: 'success', text1: t('transaction.updated'), text2: t('transaction.updatedDesc') });
      }

      onSuccess?.();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message ||
        (mode === 'create' ? t('transaction.failedCreate') : t('transaction.failedUpdate'));
      Toast.show({ type: 'error', text1: t('common.error'), text2: errorMessage });
    }
  };

  const handleDuplicate = async () => {
    if (!transaction) return;
    actionSheetRef.current?.close();
    try {
      await createMutation.mutateAsync({
        amount: transaction.amount,
        date: new Date().toISOString(),
        currencyCode: transaction.currencyCode,
        type: transaction.type,
        categoryId: transaction.categoryId!,
        description: transaction.description,
        walletId: transaction.walletId,
      });
      Toast.show({ type: 'success', text1: t('transaction.duplicated'), text2: t('transaction.duplicatedDesc') });
      onSuccess?.();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || t('transaction.failedDuplicate');
      Toast.show({ type: 'error', text1: t('common.error'), text2: errorMessage });
    }
  };

  const handleDelete = () => {
    if (!transaction) return;
    actionSheetRef.current?.close();
    setTimeout(() => setDeleteConfirmVisible(true), 300);
  };

  const handleDeleteConfirm = async () => {
    if (!transaction) return;
    setDeleteConfirmVisible(false);
    try {
      await removeMutation.mutateAsync({ id: transaction.id });
      Toast.show({ type: 'success', text1: t('transaction.deleted'), text2: t('transaction.deletedDesc') });
      onSuccess?.();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || t('transaction.failedDelete');
      Toast.show({ type: 'error', text1: t('common.error'), text2: errorMessage });
    }
  };

  if (mode === 'edit' && isLoadingTransaction) {
    return (
      <View className="flex-1 bg-card items-center justify-center py-20">
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (mode === 'edit' && (isError || !transaction)) {
    return (
      <View className="flex-1 bg-card items-center justify-center py-20 px-6">
        <Text className="text-destructive text-center text-lg">
          {t('transaction.failedLoad')}
        </Text>
      </View>
    );
  }

  const isTransfer = transactionType === TransactionType.TRANSFER;
  const isPending = isTransfer
    ? createTransferMutation.isPending
    : mode === 'create' ? createMutation.isPending : updateMutation.isPending;

  const buttonText = isTransfer
    ? (createTransferMutation.isPending ? t('transaction.transferring') : t('transaction.transfer'))
    : mode === 'create'
      ? (createMutation.isPending ? t('transaction.creating') : t('transaction.create'))
      : (updateMutation.isPending ? t('transaction.updating') : t('transaction.update'));

  return (
    <>
      <ConfirmDialog
        visible={deleteConfirmVisible}
        title={t('transaction.deleteConfirmTitle')}
        message={t('transaction.deleteConfirmMessage')}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        destructive
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirmVisible(false)}
      />

      <BottomSheet ref={actionSheetRef} enableDynamicSizing snapPoints={[]}>
        <BottomSheetView>
          <View className="px-5 pt-2 pb-8">
            <Text className="text-base font-semibold text-foreground mb-4">{t('transaction.editTitle')}</Text>
            <Pressable
              onPress={handleDuplicate}
              className="flex-row items-center gap-4 py-4 border-b border-border active:opacity-70"
            >
              <View className="w-10 h-10 rounded-2xl bg-primary/10 items-center justify-center">
                <Ionicons name="copy-outline" size={20} color={colors.primary} />
              </View>
              <Text className="text-foreground font-medium text-base">{t('transaction.duplicate')}</Text>
            </Pressable>
            <Pressable
              onPress={handleDelete}
              className="flex-row items-center gap-4 pt-4 active:opacity-70"
            >
              <View className="w-10 h-10 rounded-2xl bg-destructive/10 items-center justify-center">
                <Ionicons name="trash-outline" size={20} color={colors.destructive} />
              </View>
              <Text className="text-destructive font-medium text-base">{t('transaction.remove')}</Text>
            </Pressable>
          </View>
        </BottomSheetView>
      </BottomSheet>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-5 pb-6">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-2xl font-bold text-foreground">
              {mode === 'create' ? t('transaction.createTitle') : t('transaction.editTitle')}
            </Text>

            {mode === 'edit' && (
              <Pressable
                onPress={() => actionSheetRef.current?.open()}
                className="w-9 h-9 rounded-xl bg-secondary items-center justify-center active:opacity-70"
              >
                <Ionicons name="ellipsis-horizontal" size={18} color={colors.mutedForeground} />
              </Pressable>
            )}
          </View>

          {/* Type selector — always shown in create mode, hidden for edit of transfers */}
          {(mode === 'create' || !transaction?.transferGroupId) && (
            <FormSwitch
              control={control}
              name="type"
              label={t('transaction.type')}
              options={TRANSACTION_TYPE_OPTIONS}
              error={errors.type?.message}
            />
          )}

          {isTransfer ? (
            /* ─── Transfer fields ─── */
            <>
              <FormWalletPicker
                control={control}
                name="fromWalletId"
                label={t('transaction.fromWallet')}
                error={errors.fromWalletId?.message}
                autoSelectDefault={false}
              />

              <FormWalletPicker
                control={control}
                name="toWalletId"
                label={t('transaction.toWallet')}
                error={
                  errors.toWalletId?.message === 'sameWallet'
                    ? t('transaction.sameWalletError')
                    : errors.toWalletId?.message
                }
                excludeId={fromWalletId}
                autoSelectDefault={false}
              />

              <View className="flex-row gap-3">
                <View className="flex-1">
                  <FormInput
                    control={control}
                    name="amount"
                    label={`${t('transaction.amount')}${fromCurrency ? ` (${fromCurrency})` : ''}`}
                    placeholder="0.00"
                    numeric
                    error={errors.amount?.message}
                  />
                </View>
                <View className="flex-1">
                  <FormDatePicker
                    control={control}
                    name="date"
                    label={t('transaction.date')}
                    error={errors.date?.message}
                  />
                </View>
              </View>

              {/* Exchange rate preview */}
              {needsConversion && (
                <View style={styles.ratePreview}>
                  <Ionicons name="swap-horizontal" size={16} color={colors.primary} />
                  {rateQuery.isLoading ? (
                    <ActivityIndicator size="small" color={colors.primary} style={{ marginLeft: 8 }} />
                  ) : estimatedReceiveAmount ? (
                    <Text style={styles.rateText}>
                      ≈ <Text style={styles.rateAmount}>{estimatedReceiveAmount} {toCurrency}</Text>
                      {' '}<Text style={styles.rateNote}>({t('transaction.exchangeRateNote')})</Text>
                    </Text>
                  ) : null}
                </View>
              )}

              <FormInput
                control={control}
                name="description"
                label={t('transaction.description')}
                placeholder={t('transaction.descriptionPlaceholder')}
                multiline
                numberOfLines={3}
                error={errors.description?.message}
              />
            </>
          ) : (
            /* ─── Income / Expense fields ─── */
            <>
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <FormInput
                    control={control}
                    name="amount"
                    label={t('transaction.amount')}
                    placeholder="0.00"
                    numeric
                    error={errors.amount?.message}
                  />
                </View>
                <View className="flex-1">
                  <FormDatePicker
                    control={control}
                    name="date"
                    label={t('transaction.date')}
                    error={errors.date?.message}
                  />
                </View>
              </View>

              <View className="flex-1">
                <FormWalletPicker
                  control={control}
                  name="walletId"
                  label={t('transaction.wallet')}
                  error={errors.walletId?.message}
                />
              </View>
              <View className="flex-1">
                <FormCurrencyPicker
                  control={control}
                  name="currencyCode"
                  label={t('transaction.currency')}
                  error={errors.currencyCode?.message}
                />
              </View>

              <FormCategoryPicker
                control={control}
                name="categoryId"
                label={t('transaction.category')}
                transactionType={transactionType}
                error={errors.categoryId?.message}
              />

              <FormInput
                control={control}
                name="description"
                label={t('transaction.description')}
                placeholder={t('transaction.descriptionPlaceholder')}
                multiline
                numberOfLines={3}
                error={errors.description?.message}
              />
            </>
          )}

          <Pressable
            onPress={handleSubmit(onSubmit)}
            disabled={isPending}
            className={`py-4 rounded-2xl mt-4 ${
              isPending ? 'bg-primary/50' : 'bg-primary active:bg-primary/90'
            }`}
          >
            <Text className="text-primary-foreground text-center font-semibold text-base">
              {buttonText}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  ratePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '12',
    borderWidth: 1,
    borderColor: colors.primary + '30',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
  },
  rateText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.foreground,
  },
  rateAmount: {
    fontWeight: '600',
    color: colors.primary,
  },
  rateNote: {
    color: colors.mutedForeground,
    fontSize: 12,
  },
});
