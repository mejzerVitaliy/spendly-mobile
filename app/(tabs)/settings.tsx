import { useAuth } from '@/shared/hooks';
import { Button } from '@/shared/ui';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const { logoutMutation } = useAuth();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1">
        <View className="flex-1 px-5 py-4">
          <Text className="text-3xl font-bold text-foreground mb-2">Profile</Text>
          <Text className="text-muted-foreground mb-6">user@example.com</Text>
          
          <Button 
            title="Log out" 
            variant="destructive"
            onPress={handleLogout}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
