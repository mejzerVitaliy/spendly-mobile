import { useTransactions } from '@/shared/hooks';
import { Transaction } from '@/shared/types';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

interface TransactionsListProps {
  onTransactionPress?: (transaction: Transaction) => void;
}

export function TransactionsList({ onTransactionPress }: TransactionsListProps) {
  const { getAllQuery } = useTransactions();

  if (getAllQuery.isLoading) {
    return (
      <View className="py-8 items-center justify-center">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (getAllQuery.isError) {
    return (
      <View className="py-8 items-center justify-center">
        <Text className="text-destructive text-center">
          Fetching transactions failed
        </Text>
      </View>
    );
  }

  const transactions = getAllQuery.data?.data || [];

  return (
    <View className="mt-4">
      <Text className="text-2xl font-bold text-foreground mb-4">Transactions</Text>

      {transactions.length === 0 ? (
        <View className="py-8 items-center justify-center">
          <Text className="text-muted-foreground text-center">
            No transactions.{'\n'}Create your first transaction!
          </Text>
        </View>
      ) : (
        <View>
          {transactions.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => onTransactionPress?.(item)}
                className="bg-card rounded-lg p-4 mb-3 shadow-sm border border-border active:opacity-80"
              >
                <View className="flex-row justify-between items-start mb-2">
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-foreground">
                      {item.amount} {item.currencyCode}
                    </Text>
                    <Text className="text-sm text-muted-foreground mt-1">
                      {item.category}
                    </Text>
                  </View>
                  <View
                    className={`px-3 py-1 rounded-full ${
                      item.type === 'INCOME' ? 'bg-success/10' : 'bg-destructive/10'
                    }`}
                  >
                    <Text
                      className={`text-xs font-medium ${
                        item.type === 'INCOME' ? 'text-success' : 'text-destructive'
                      }`}
                    >
                      {item.type === 'INCOME' ? 'Income' : 'Expense'}
                    </Text>
                  </View>
                </View>

                {item.description && (
                  <Text className="text-sm text-muted-foreground mb-2">
                    {item.description}
                  </Text>
                )}

                <Text className="text-xs text-muted-foreground/70">
                  {new Date(item.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
              </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}