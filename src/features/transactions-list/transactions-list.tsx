import { useGetAllTransactions } from '@/shared/hooks';
import { formatCompact } from '@/shared/utils';
import { Transaction } from '@/shared/types';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';

interface TransactionsListProps {
  onTransactionPress?: (transaction: Transaction) => void;
  startDate?: string;
  endDate?: string;
  search?: string;
}

interface GroupedTransactions {
  [date: string]: Transaction[];
}

function SkeletonRow() {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 700 }),
        withTiming(0.4, { duration: 700 }),
      ),
      -1,
      false,
    );
  }, [opacity]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View className="flex-row items-center bg-card rounded-2xl p-4 mb-2 border border-border" style={style}>
      <View className="w-10 h-10 rounded-full bg-muted mr-3" />
      <View className="flex-1 gap-2">
        <View className="h-3.5 w-32 bg-muted rounded-md" />
        <View className="h-2.5 w-20 bg-muted rounded-md" />
      </View>
      <View className="h-4 w-16 bg-muted rounded-md" />
    </Animated.View>
  );
}

function TransactionRow({
  item,
  onPress,
  index,
}: {
  item: Transaction;
  onPress?: () => void;
  index: number;
}) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(12);

  useEffect(() => {
    const delay = index * 40;
    setTimeout(() => {
      opacity.value = withTiming(1, { duration: 300 });
      translateY.value = withTiming(0, { duration: 300 });
    }, delay);
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const isIncome = item.type === 'INCOME';
  const amountColor = isIncome ? '#22C55E' : '#EF4444';
  const iconBg = isIncome ? '#22C55E20' : '#EF444420';

  return (
    <Animated.View style={style}>
      <Pressable
        onPress={onPress}
        className="flex-row items-center bg-card rounded-2xl px-4 py-3 mb-2 border border-border active:opacity-70"
      >
        <View
          className="w-10 h-10 rounded-full items-center justify-center mr-3"
          style={{ backgroundColor: item.category?.color ? `${item.category.color}25` : iconBg }}
        >
          <Ionicons
            name={isIncome ? 'arrow-down' : 'arrow-up'}
            size={16}
            color={item.category?.color ?? amountColor}
          />
        </View>

        <View className="flex-1 mr-2">
          <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>
            {item.category?.name ?? 'Unknown'}
          </Text>
          {item.description ? (
            <Text className="text-xs text-muted-foreground mt-0.5" numberOfLines={1}>
              {item.description}
            </Text>
          ) : null}
        </View>

        <View className="items-end">
          <Text className="text-sm font-bold" style={{ color: amountColor }}>
            {isIncome ? '+' : '-'}{formatCompact(item.amount)} {item.currencyCode}
          </Text>
          {item.currencyCode !== item.mainCurrencyCode && (
            <Text className="text-xs text-muted-foreground mt-0.5">
              {formatCompact(item.convertedAmount)} {item.mainCurrencyCode}
            </Text>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
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
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(transaction);
    });
    return grouped;
  }, [query.data]);

  if (query.isLoading) {
    return (
      <View className="mt-4">
        <View className="h-6 w-36 bg-muted rounded-lg mb-4" />
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonRow key={i} />
        ))}
      </View>
    );
  }

  if (query.isError) {
    return (
      <View className="mt-4 py-10 items-center justify-center">
        <Ionicons name="alert-circle-outline" size={32} color="#EF4444" />
        <Text className="text-destructive text-center mt-2 text-sm">
          Failed to load transactions
        </Text>
      </View>
    );
  }

  const dateKeys = Object.keys(groupedTransactions);
  let globalIndex = 0;

  return (
    <View className="mt-4">
      <Text className="text-lg font-bold text-foreground mb-3">Transactions</Text>

      {dateKeys.length === 0 ? (
        <View className="py-12 items-center justify-center">
          <Ionicons name="receipt-outline" size={40} color="#374151" />
          <Text className="text-muted-foreground text-center mt-3 text-sm">
            No transactions for this period
          </Text>
        </View>
      ) : (
        dateKeys.map((date) => (
          <View key={date} className="mb-3">
            <Text className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
              {date}
            </Text>
            {groupedTransactions[date].map((item) => {
              const idx = globalIndex++;
              return (
                <TransactionRow
                  key={item.id}
                  item={item}
                  onPress={() => onTransactionPress?.(item)}
                  index={idx}
                />
              );
            })}
          </View>
        ))
      )}
    </View>
  );
}
