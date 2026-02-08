import { useGetAllTransactions } from '@/shared/hooks';
import { Transaction } from '@/shared/types';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useMemo } from 'react';

interface TransactionsListProps {
  onTransactionPress?: (transaction: Transaction) => void;
  startDate?: string;
  endDate?: string;
  search?: string;
}

interface GroupedTransactions {
  [date: string]: Transaction[];
}

export function TransactionsList({ onTransactionPress, startDate, endDate, search }: TransactionsListProps) {
  const query = useGetAllTransactions({ startDate, endDate, search });

  const groupedTransactions = useMemo(() => {
    if (!query.data?.data) return {};

    const grouped: GroupedTransactions = {};
    query.data.data.forEach((transaction) => {
      const date = new Date(transaction.date).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(transaction);
    });
    return grouped;
  }, [query.data]);

  if (query.isLoading) {
    return (
      <View className="py-8 items-center justify-center">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (query.isError) {
    return (
      <View className="py-8 items-center justify-center">
        <Text className="text-destructive text-center">
          Fetching transactions failed
        </Text>
      </View>
    );
  }

  const dateKeys = Object.keys(groupedTransactions);

  return (
    <View className="mt-4">
      <Text className="text-2xl font-bold text-foreground mb-4">Transactions</Text>

      {dateKeys.length === 0 ? (
        <View className="py-8 items-center justify-center">
          <Text className="text-muted-foreground text-center">
            No transactions
          </Text>
        </View>
      ) : (
        <View>
          {dateKeys.map((date) => (
            <View key={date} className="mb-4">
              <Text className="text-sm font-medium text-muted-foreground mb-2">
                {date}
              </Text>
              {groupedTransactions[date].map((item) => (
                <Pressable
                  key={item.id}
                  onPress={() => onTransactionPress?.(item)}
                  className="h-[70px] bg-card rounded-lg p-3 mb-2 border border-border active:opacity-80"
                >
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2 mb-1">
                        {item.category?.color && (
                          <View 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: item.category.color }}
                          />
                        )}
                        <Text className="text-sm font-medium text-foreground">
                          {item.category?.name}
                        </Text>
                      </View>
                      {item.description && (
                        <Text className="text-xs text-muted-foreground" numberOfLines={1}>
                          {item.description}
                        </Text>
                      )}
                    </View>
                    <View className="items-end">
                      <Text
                        className={`text-base font-semibold ${
                          item.type === 'INCOME' ? 'text-success' : 'text-destructive'
                        }`}
                      >
                        {item.type === 'INCOME' ? '+' : '-'}{(item.amount / 100).toFixed(2)} {item.currencyCode}
                      </Text>
                      {item.currencyCode !== item.mainCurrencyCode && (
                        <Text className="text-xs text-muted-foreground mt-0.5">
                          {item.type === 'INCOME' ? '+' : '-'}{(item.convertedAmount / 100).toFixed(2)} {item.mainCurrencyCode}
                        </Text>
                      )}
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}