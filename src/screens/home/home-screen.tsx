import { BalanceView } from '@/features/balance-view';
import { EditTransaction, EditTransactionRef } from '@/features/edit-transaction';
import { PeriodSelector } from '@/features/period-selector';
import { TransactionSearch } from '@/features/transaction-search';
import { TransactionsList } from '@/features/transactions-list';
import { useHomeStore } from '@/shared/stores';
import { Transaction } from '@/shared/types';
import { getDateRangeForPeriod } from '@/shared/utils';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function HomeScreen() {
  const editTransactionRef = useRef<EditTransactionRef>(null);
  const { periodType, currentDate, startDate, endDate, setDateRange } = useHomeStore();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const { startDate: start, endDate: end } = getDateRangeForPeriod(currentDate, periodType);
    setDateRange(start, end);
  }, [currentDate, periodType, setDateRange]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const handleTransactionPress = (transaction: Transaction) => {
    editTransactionRef.current?.open(transaction.id);
  };

  const handleSearchChange = useCallback((searchText: string) => {
    setSearch(searchText);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 bg-background">
        <View className="px-5 pt-5">
          <Text className="text-3xl font-bold text-foreground mb-2">Spendly</Text>
          <Text className="text-muted-foreground mb-6">Finance management</Text>

          <PeriodSelector store="home" />

          <TransactionSearch onSearchChange={handleSearchChange} />

          <BalanceView startDate={startDate} endDate={endDate} />
          
          <TransactionsList 
            onTransactionPress={handleTransactionPress}
            startDate={startDate}
            endDate={endDate}
            search={debouncedSearch}
          />
        </View>
      </ScrollView>

      <EditTransaction ref={editTransactionRef} />
    </SafeAreaView>
  );
}
