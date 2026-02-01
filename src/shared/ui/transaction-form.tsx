import { TransactionType } from '@/shared/constants';
import { useTransactions } from '@/shared/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';
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
  const { createMutation, updateMutation, removeMutation, getByIdQuery } = useTransactions();
  const [menuVisible, setMenuVisible] = useState(false);

  const { data: transactionData, isLoading: isLoadingTransaction, isError } = 
    mode === 'edit' && transactionId ? getByIdQuery(transactionId) : { data: null, isLoading: false, isError: false };
  
  const transaction = transactionData?.data;

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      amount: 0,
      date: new Date().toISOString(),
      currencyCode: 'USD',
      type: TransactionType.EXPENSE,
      categoryId: '',
      description: '',
    },
  });

  useEffect(() => {
    if (mode === 'edit' && transaction) {
      reset({
        amount: transaction.amount / 100,
        date: transaction.date,
        currencyCode: transaction.currencyCode,
        type: transaction.type,
        categoryId: transaction.categoryId,
        description: transaction.description || '',
        walletId: transaction.walletId,
      });
    }
  }, [transaction, reset, mode]);

  const onSubmit = async (data: TransactionFormData) => {
    try {
      const payload = {
        ...data,
        amount: Math.round(data.amount * 100),
      };

      if (mode === 'create') {
        await createMutation.mutateAsync(payload);
        Alert.alert('Success', 'Transaction created');
        reset();
      } else if (mode === 'edit' && transaction) {
        await updateMutation.mutateAsync({
          id: transaction.id,
          request: payload,
        });
        Alert.alert('Success', 'Transaction updated');
      }
      
      onSuccess?.();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || `Error ${mode === 'create' ? 'creating' : 'updating'} transaction`;
      Alert.alert('Error', errorMessage);
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
      Alert.alert('Success', 'Transaction duplicated');
      onSuccess?.();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Error duplicating transaction';
      Alert.alert('Error', errorMessage);
    }
  };

  const handleDelete = () => {
    if (!transaction) return;
    
    setMenuVisible(false);
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeMutation.mutateAsync({ id: transaction.id });
              Alert.alert('Success', 'Transaction deleted');
              onSuccess?.();
            } catch (error: any) {
              const errorMessage = error?.response?.data?.message || 'Error deleting transaction';
              Alert.alert('Error', errorMessage);
            }
          },
        },
      ]
    );
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
              keyboardType="decimal-pad"
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
          transactionType={control._formValues.type}
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
  );
}
