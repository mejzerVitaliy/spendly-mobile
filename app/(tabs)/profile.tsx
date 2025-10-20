import { View, Text, SafeAreaView } from 'react-native';
import { Button } from '@/components/ui';
import { useAuth } from '@/hooks';

export default function ProfileScreen() {
  const { logoutMutation } = useAuth();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1 p-6">
        <Text className="text-3xl font-bold mb-4">Профиль</Text>
        
        {/* TODO: Отобразить данные пользователя из store */}
        <Text className="text-gray-600 mb-6">user@example.com</Text>
        
        <Button 
          title="Выйти" 
          variant="secondary"
          onPress={handleLogout}
        />
      </View>
    </SafeAreaView>
  );
}
