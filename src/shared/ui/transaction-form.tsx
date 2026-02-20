import { TransactionType } from '@/shared/constants';
import { useAuth, useTransactions, useGetTransactionById } from '@/shared/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { ConfirmDialog } from './confirm-dialog';
import { z } from 'zod';
import { FormCategoryPicker } from './form-category-picker';
import { FormCurrencyPicker } from './form-currency-picker';
import { FormDatePicker } from './form-date-picker';
import { FormInput } from './form-input';
import { FormSwitch } from './form-switch';
import { FormWalletPicker } from './form-wallet-picker';

const TRANSACTION_TYPE_OPTIONS = [
  { label: 'Income', value: TransactionType.INCOME },
  { label: 'Expense', value: TransactionType.EXPENSE },
];

const transactionSchema = z.object({
  amount: z.coerce.number().positive('Amount must be positive'),
  date: z.string().datetime(),
  currencyCode: z.string().length(3),
  description: z.string().optional(),
  categoryId: z.string().uuid('Select category'),
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
  const [menuVisible, setMenuVisible] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  
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
      amount: 0,
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

  const onSubmit = async (data: TransactionFormData) => {
    try {
      const payload = {
        ...data,
        amount: Math.round(data.amount * 100),
      };

      if (mode === 'create') {
        await createMutation.mutateAsync(payload);
        Toast.show({ type: 'success', text1: 'Transaction created', text2: 'Your transaction has been added' });
        reset();
      } else if (mode === 'edit' && transaction) {
        await updateMutation.mutateAsync({
          id: transaction.id,
          request: payload,
        });
        Toast.show({ type: 'success', text1: 'Transaction updated', text2: 'Changes saved successfully' });
      }
      
      onSuccess?.();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || `Error ${mode === 'create' ? 'creating' : 'updating'} transaction`;
      Toast.show({ type: 'error', text1: 'Error', text2: errorMessage });
    }
  };

  const handleDuplicate = async () => {
    if (!transaction) return;
    
    setMenuVisible(false);
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
      Toast.show({ type: 'success', text1: 'Transaction duplicated', text2: 'A copy has been created' });
      onSuccess?.();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Error duplicating transaction';
      Toast.show({ type: 'error', text1: 'Error', text2: errorMessage });
    }
  };

  const handleDelete = () => {
    if (!transaction) return;
    setMenuVisible(false);
    setDeleteConfirmVisible(true);
  };

  const handleDeleteConfirm = async () => {
    if (!transaction) return;
    setDeleteConfirmVisible(false);
    try {
      await removeMutation.mutateAsync({ id: transaction.id });
      Toast.show({ type: 'success', text1: 'Transaction deleted', text2: 'The transaction has been removed' });
      onSuccess?.();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Error deleting transaction';
      Toast.show({ type: 'error', text1: 'Error', text2: errorMessage });
    }
  };

  if (mode === 'edit' && isLoadingTransaction) {
    return (
      <View className="flex-1 bg-card items-center justify-center py-20">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (mode === 'edit' && (isError || !transaction)) {
    return (
      <View className="flex-1 bg-card items-center justify-center py-20 px-6">
        <Text className="text-destructive text-center text-lg">
          Failed to load transaction
        </Text>
      </View>
    );
  }

  const isPending = mode === 'create' ? createMutation.isPending : updateMutation.isPending;
  const buttonText = mode === 'create' 
    ? (createMutation.isPending ? 'Creating...' : 'Create transaction')
    : (updateMutation.isPending ? 'Updating...' : 'Update transaction');

  return (
    <>
    <ConfirmDialog
      visible={deleteConfirmVisible}
      title="Delete Transaction"
      message="Are you sure you want to delete this transaction? This action cannot be undone."
      confirmText="Delete"
      destructive
      onConfirm={handleDeleteConfirm}
      onCancel={() => setDeleteConfirmVisible(false)}
    />
    <ScrollView className="flex-1 bg-card" showsVerticalScrollIndicator={false}>
      <View className="px-6 pb-6">
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-2xl font-bold text-foreground">
            {mode === 'create' ? 'Create transaction' : 'Edit transaction'}
          </Text>
          
          {mode === 'edit' && (
            <Pressable
              onPress={() => setMenuVisible(true)}
              className="p-2 active:opacity-70"
            >
              <Text className="text-2xl text-foreground">⋮</Text>
            </Pressable>
          )}
        </View>

        {mode === 'edit' && menuVisible && (
          <Pressable
            className="absolute top-0 left-0 right-0 bottom-0 z-50"
            onPress={() => setMenuVisible(false)}
          >
            <View className="absolute top-16 right-6 bg-card border border-border rounded-lg shadow-lg overflow-hidden">
              <Pressable
                onPress={handleDuplicate}
                className="px-4 py-3 border-b border-border active:bg-muted"
              >
                <Text className="text-foreground font-medium">📋 Duplicate Transaction</Text>
              </Pressable>
              
              <Pressable
                onPress={handleDelete}
                className="px-4 py-3 active:bg-destructive/10"
              >
                <Text className="text-destructive font-medium">🗑️ Remove Transaction</Text>
              </Pressable>
            </View>
          </Pressable>
        )}

        <FormSwitch
          control={control}
          name="type"
          label="Transaction type"
          options={TRANSACTION_TYPE_OPTIONS}
          error={errors.type?.message}
        />

        <View className="flex-row gap-3">
          <View className="flex-1">
            <FormInput
              control={control}
              name="amount"
              label="Amount"
              placeholder="0.00"
              numeric
              error={errors.amount?.message}
            />
          </View>
          <View className="flex-1">
            <FormDatePicker
              control={control}
              name="date"
              label="Date"
              error={errors.date?.message}
            />
          </View>
        </View>

          <View className="flex-1">
            <FormWalletPicker
              control={control}
              name="walletId"
              label="Wallet"
              error={errors.walletId?.message}
            />
          </View>
          <View className="flex-1">
            <FormCurrencyPicker
              control={control}
              name="currencyCode"
              label="Currency"
              error={errors.currencyCode?.message}
            />
          </View>

        <FormCategoryPicker
          control={control}
          name="categoryId"
          label="Category"
          transactionType={transactionType}
          error={errors.categoryId?.message}
        />

        <FormInput
          control={control}
          name="description"
          label="Description (optional)"
          placeholder="Add description..."
          multiline
          numberOfLines={3}
          error={errors.description?.message}
        />

        <Pressable
          onPress={handleSubmit(onSubmit)}
          disabled={isPending}
          className={`py-4 rounded-lg mt-4 ${
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
