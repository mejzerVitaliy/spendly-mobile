import { TransactionType } from '@/shared/constants';
import { useAuth, useTransactions, useGetTransactionById } from '@/shared/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
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

const transactionSchema = z.object({
  amount: z.coerce.number().positive(),
  date: z.string().datetime(),
  currencyCode: z.string().length(3),
  description: z.string().optional(),
  categoryId: z.string().uuid(),
  type: z.nativeEnum(TransactionType),
  walletId: z.string().uuid().optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface TransactionFormProps {
  mode: 'create' | 'edit';
  transactionId?: string;
  onSuccess?: () => void;
}

export function TransactionForm({ mode, transactionId, onSuccess }: TransactionFormProps) {
  const { createMutation, updateMutation, removeMutation } = useTransactions();
  const { getMeQuery } = useAuth();
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

  useEffect(() => {
    if (mode === 'edit' && transaction) {
      reset({
        amount: transaction.amount / 100,
        date: transaction.date,
        currencyCode: transaction.currencyCode,
        type: transaction.type as TransactionType,
        categoryId: transaction.categoryId,
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

  const TRANSACTION_TYPE_OPTIONS = [
    { label: t('transaction.income'), value: TransactionType.INCOME },
    { label: t('transaction.expense'), value: TransactionType.EXPENSE },
  ];

  const onSubmit = async (data: TransactionFormData) => {
    try {
      const payload = {
        ...data,
        amount: Math.round(data.amount * 100),
      };

      if (mode === 'create') {
        await createMutation.mutateAsync(payload);
        Toast.show({ type: 'success', text1: t('transaction.created'), text2: t('transaction.createdDesc') });
        reset();
      } else if (mode === 'edit' && transaction) {
        await updateMutation.mutateAsync({
          id: transaction.id,
          request: payload,
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
        categoryId: transaction.categoryId,
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

  const isPending = mode === 'create' ? createMutation.isPending : updateMutation.isPending;
  const buttonText = mode === 'create'
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

          <FormSwitch
            control={control}
            name="type"
            label={t('transaction.type')}
            options={TRANSACTION_TYPE_OPTIONS}
            error={errors.type?.message}
          />

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
