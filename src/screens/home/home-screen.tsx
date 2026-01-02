import { CreateTransaction } from '@/features/create-transaction/manually';
import { Button, Card } from '@/shared/ui';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1">
        <View className="px-5">
          <Text className="text-3xl font-bold text-foreground mb-2">Spendly</Text>
          <Text className="text-muted-foreground mb-6">Finance management</Text>

          <Card className="mb-4">
            <Text className="text-lg font-semibold text-foreground mb-2">Balance</Text>
            <Text className="text-3xl font-bold text-primary">0 ₽</Text>
          </Card>

          <View className="flex-row gap-3 mb-4">
            <Card className="flex-1">
              <Text className="text-sm text-muted-foreground">Income</Text>
              <Text className="text-xl font-bold text-success">0 ₽</Text>
            </Card>
            <Card className="flex-1">
              <Text className="text-sm text-muted-foreground">Expenses</Text>
              <Text className="text-xl font-bold text-destructive">0 ₽</Text>
            </Card>
          </View>

          <Button 
            title="Add transaction" 
            onPress={() => console.log('Add transaction')}
          />
          
          <View className="mt-3">
            <Button 
              title="View history" 
              variant="secondary"
              onPress={() => console.log('History')}
            />
          </View> 
        </View>
      </ScrollView>

      <CreateTransaction />
    </SafeAreaView>
  );
}
