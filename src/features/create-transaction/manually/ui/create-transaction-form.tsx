import { Category, Currency, TransactionType } from '@/shared/constants';
import { useTransactions } from '@/shared/hooks';
import { FormDatePicker, FormInput, FormPicker, FormSwitch } from '@/shared/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { CreateTransactionFormData, createTransactionSchema } from '../schemas';

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

interface CreateTransactionFormProps {
  onSuccess?: () => void;
}

const CreateTransactionForm = ({ onSuccess }: CreateTransactionFormProps) => {
  const { createMutation } = useTransactions();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateTransactionFormData>({
    resolver: zodResolver(createTransactionSchema),
    defaultValues: {
      amount: 0,
      date: new Date().toISOString(),
      currency: Currency.USD,
      type: TransactionType.EXPENSE,
      category: Category.FOOD,
      description: '',
    },
  });

  const onSubmit = async (data: CreateTransactionFormData) => {
    try {
      await createMutation.mutateAsync(data);
      Alert.alert('Success', 'Transaction created');
      reset();
      onSuccess?.();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Error creating transaction';
      Alert.alert('Error', errorMessage);
    }
  };

  return (
    <ScrollView className="flex-1 bg-card" showsVerticalScrollIndicator={false}>
      <View className="px-6 pb-6">
        <Text className="text-2xl font-bold text-foreground mb-6">
          Create transaction
        </Text>

        <FormSwitch
          control={control}
          name="type"
          label="Transaction type"
          options={TRANSACTION_TYPE_OPTIONS}
          error={errors.type?.message}
        />

        <FormInput
          control={control}
          name="amount"
          label="Amount"
          placeholder="0.00"
          keyboardType="decimal-pad"
          error={errors.amount?.message}
        />

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
          disabled={createMutation.isPending}
          className={`py-4 rounded-lg mt-4 ${
            createMutation.isPending ? 'bg-primary/50' : 'bg-primary active:bg-primary/90'
          }`}
        >
          <Text className="text-primary-foreground text-center font-semibold text-base">
            {createMutation.isPending ? 'Creating...' : 'Create transaction'}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
};

export { CreateTransactionForm };
