import { BalanceView } from '@/features/balance-view';
import { CreateTransaction } from '@/features/create-transaction/manually';
import { EditTransaction, EditTransactionRef } from '@/features/edit-transaction';
import { TransactionsList } from '@/features/transactions-list';
import { Transaction } from '@/shared/types';
import { useRef } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function HomeScreen() {
  const editTransactionRef = useRef<EditTransactionRef>(null);

  const handleTransactionPress = (transaction: Transaction) => {
    editTransactionRef.current?.open(transaction);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1">
        <View className="px-5">
          <Text className="text-3xl font-bold text-foreground mb-2">Spendly</Text>
          <Text className="text-muted-foreground mb-6">Finance management</Text>

          <BalanceView />
          
          <TransactionsList onTransactionPress={handleTransactionPress} />
           
        </View>
      </ScrollView>

      <CreateTransaction />
      <EditTransaction ref={editTransactionRef} />
    </SafeAreaView>
  );
}
