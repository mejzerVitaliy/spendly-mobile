import { SafeAreaView, ScrollView, Text, View } from 'react-native';
import { Button, Card } from '@/components/ui';

export function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        <View className="p-5">
          <Text className="text-3xl font-bold mb-2">Spendly</Text>
          <Text className="text-gray-600 mb-6">Управление финансами</Text>

          <Card className="mb-4">
            <Text className="text-lg font-semibold mb-2">Баланс</Text>
            <Text className="text-3xl font-bold text-blue-600">0 ₽</Text>
          </Card>

          <View className="flex-row gap-3 mb-4">
            <Card className="flex-1">
              <Text className="text-sm text-gray-600">Доходы</Text>
              <Text className="text-xl font-bold text-green-600">0 ₽</Text>
            </Card>
            <Card className="flex-1">
              <Text className="text-sm text-gray-600">Расходы</Text>
              <Text className="text-xl font-bold text-red-600">0 ₽</Text>
            </Card>
          </View>

          <Button 
            title="Добавить транзакцию" 
            onPress={() => console.log('Добавить транзакцию')}
          />
          
          <View className="mt-3">
            <Button 
              title="Просмотреть историю" 
              variant="secondary"
              onPress={() => console.log('История')}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
