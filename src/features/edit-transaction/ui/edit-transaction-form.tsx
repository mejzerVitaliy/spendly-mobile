import { Category, Currency, TransactionType } from '@/shared/constants';
import { useTransactions } from '@/shared/hooks';
import { Transaction } from '@/shared/types';
import { FormDatePicker, FormPicker, FormSwitch, Input } from '@/shared/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { EditTransactionFormData, editTransactionSchema } from '../schemas';

const CATEGORY_OPTIONS = [
  { label: 'Salary', value: Category.SALARY },
  { label: 'Gift', value: Category.GIFT },
  { label: 'Investment', value: Category.INVESTMENT },
  { label: 'Food', value: Category.FOOD },
  { label: 'Transport', value: Category.TRANSPORT },
  { label: 'Housing', value: Category.HOUSING },
  { label: 'Utilities', value: Category.UTILITIES },
  { label: 'Health', value: Category.HEALTH },
  { label: 'Hobby', value: Category.HOBBY },
  { label: 'Other', value: Category.OTHER },
];

const CURRENCY_OPTIONS = [
  { label: 'USD ($)', value: Currency.USD },
  { label: 'EUR (€)', value: Currency.EUR },
  { label: 'UAH (₴)', value: Currency.UAH },
];

const TRANSACTION_TYPE_OPTIONS = [
  { label: 'Income', value: TransactionType.INCOME },
  { label: 'Expense', value: TransactionType.EXPENSE },
];

interface EditTransactionFormProps {
  transaction: Transaction;
  onSuccess?: () => void;
}

const EditTransactionForm = ({ transaction, onSuccess }: EditTransactionFormProps) => {
  const { updateMutation, createMutation, removeMutation } = useTransactions();
  const [menuVisible, setMenuVisible] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<EditTransactionFormData>({
    resolver: zodResolver(editTransactionSchema),
    defaultValues: {
      amount: transaction.amount,
      date: transaction.date,
      currency: transaction.currency,
      type: transaction.type,
      category: transaction.category,
      description: transaction.description || '',
    },
  });

  const onSubmit = async (data: EditTransactionFormData) => {
    try {
      await updateMutation.mutateAsync({
        id: transaction.id,
        request: data,
      });
      Alert.alert('Success', 'Transaction updated');
      onSuccess?.();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Error updating transaction';
      Alert.alert('Error', errorMessage);
    }
  };

  const handleDuplicate = async () => {
    setMenuVisible(false);
    try {
      await createMutation.mutateAsync({
        amount: transaction.amount,
        date: new Date().toISOString(),
        currency: transaction.currency,
        type: transaction.type,
        category: transaction.category,
        description: transaction.description,
      });
      Alert.alert('Success', 'Transaction duplicated');
      onSuccess?.();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Error duplicating transaction';
      Alert.alert('Error', errorMessage);
    }
  };

  const handleDelete = () => {
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

  return (
    <ScrollView className="flex-1 bg-card" showsVerticalScrollIndicator={false}>
      <View className="px-6 pb-6">
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-2xl font-bold text-foreground">
            Edit transaction
          </Text>
          
          <Pressable
            onPress={() => setMenuVisible(true)}
            className="p-2 active:opacity-70"
          >
            <Text className="text-2xl text-foreground">⋮</Text>
          </Pressable>
        </View>

        {menuVisible && (
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

        <View className="mb-4">
          <Text className="text-sm font-medium text-foreground mb-2">Amount</Text>
          <Controller
            control={control}
            name="amount"
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder="0.00"
                keyboardType="decimal-pad"
                value={String(value)}
                onChangeText={(text) => {
                  const cleaned = text.replace(/[^0-9.]/g, '');
                  const numValue = cleaned === '' ? 0 : parseFloat(cleaned);
                  if (!isNaN(numValue)) {
                    onChange(numValue);
                  }
                }}
                error={errors.amount?.message}
              />
            )}
          />
        </View>

        <FormPicker
          control={control}
          name="currency"
          label="Currency"
          options={CURRENCY_OPTIONS}
          error={errors.currency?.message}
        />

        <FormDatePicker
          control={control}
          name="date"
          label="Date"
          error={errors.date?.message}
        />

        <FormPicker
          control={control}
          name="category"
          label="Category"
          options={CATEGORY_OPTIONS}
          error={errors.category?.message}
        />

        <View className="mb-4">
          <Text className="text-sm font-medium text-foreground mb-2">Description (optional)</Text>
          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder="Add description..."
                multiline
                numberOfLines={3}
                value={value || ''}
                onChangeText={onChange}
                error={errors.description?.message}
              />
            )}
          />
        </View>

        <Pressable
          onPress={handleSubmit(onSubmit)}
          disabled={updateMutation.isPending}
          className={`py-4 rounded-lg mt-4 ${
            updateMutation.isPending ? 'bg-primary/50' : 'bg-primary active:bg-primary/90'
          }`}
        >
          <Text className="text-primary-foreground text-center font-semibold text-base">
            {updateMutation.isPending ? 'Updating...' : 'Update transaction'}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
};

export { EditTransactionForm };
