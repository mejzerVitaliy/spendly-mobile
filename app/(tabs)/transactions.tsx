import { useTransactions } from '@/shared/hooks';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TransactionsScreen() {
  const { getAllQuery } = useTransactions();

  if (getAllQuery.isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#3b82f6" />
      </SafeAreaView>
    );
  }

  if (getAllQuery.isError) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center px-5">
        <Text className="text-destructive text-center">
          Ошибка загрузки транзакций
        </Text>
      </SafeAreaView>
    );
  }

  const transactions = getAllQuery.data?.data || [];

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-5">
        <Text className="text-3xl font-bold text-foreground mb-4 mt-2">Transactions</Text>

        {transactions.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-muted-foreground text-center">
              No transactions.{'\n'}Create your first transaction!
            </Text>
          </View>
        ) : (
          <FlatList
            data={transactions}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View className="bg-card rounded-lg p-4 mb-3 shadow-sm border border-border">
                <View className="flex-row justify-between items-start mb-2">
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-foreground">
                      {item.amount} {item.currency}
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
                      {item.type === 'INCOME' ? 'Доход' : 'Расход'}
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
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}