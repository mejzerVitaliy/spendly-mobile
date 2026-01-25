import { SettingsItem } from '@/shared/ui';
import { useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function SettingsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1">
        <View className="px-5 py-4">
          <Text className="text-3xl font-bold text-foreground mb-2">Settings</Text>
          <Text className="text-muted-foreground mb-6">Manage your preferences</Text>
        </View>

        <View className="w-full">
          <SettingsItem
            title="Account"
            icon="person-outline"
            onPress={() => router.push('/settings/account')}
          />

          <SettingsItem
            title="Currencies"
            icon="cash-outline"
            onPress={() => router.push('/settings/currencies')}
          />

          <SettingsItem
            title="Language"
            icon="language-outline"
            disabled
          />

          <SettingsItem
            title="Notifications"
            icon="notifications-outline"
            disabled
          />

          <SettingsItem
            title="Security"
            icon="shield-checkmark-outline"
            onPress={() => router.push('/settings/security')}
          />

          <SettingsItem
            title="Data & Storage"
            icon="server-outline"
            onPress={() => router.push('/settings/data-storage')}
          />

          <SettingsItem
            title="Support & About"
            icon="information-circle-outline"
            onPress={() => router.push('/settings/support-about')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
