import { SettingsHeader, Input, Button, Separator } from '@/shared/ui';
import { useAuthStore } from '@/shared/stores';
import { useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function AccountScreen() {
  const { user } = useAuthStore();
  const router = useRouter();
  const isGuest = user?.type === 'GUEST';

  if (isGuest) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <ScrollView className="flex-1">
          <View className="px-5 py-4">
            <SettingsHeader
              title="Account"
              description="You are using a guest account"
            />

            <View className="bg-card rounded-xl p-5 border border-border mb-6">
              <Text className="text-base text-foreground mb-2">
                Create an account to secure your data and access it from any device.
              </Text>
              <Text className="text-sm text-muted-foreground">
                All your current data will be preserved.
              </Text>
            </View>

            <View className="gap-3">
              <Button
                title="Create Account"
                onPress={() => router.push('/settings/create-account' as any)}
              />
              <Button
                title="Login to Existing Account"
                variant="outline"
                onPress={() => router.push('/settings/login' as any)}
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1">
        <View className="px-5 py-4">
          <SettingsHeader 
            title="Account" 
            description="Manage your personal information"
          />

          <Text className="text-xs font-semibold text-muted-foreground uppercase mb-3">
            Personal Information
          </Text>

          <View className="mb-4">
            <Text className="text-sm font-medium text-foreground mb-2">Email</Text>
            <Input 
              placeholder="Enter your email"
              value={user?.email ?? ''}
              keyboardType="email-address"
              disabled
            />
          </View>

          <Separator className="my-6" />

          <Text className="text-xs font-semibold text-muted-foreground uppercase mb-3">
            Profile Picture
          </Text>

          <Button 
            title="Upload Photo" 
            variant="outline"
            onPress={() => {}}
            className="mb-6"
          />

          <Button 
            title="Save Changes" 
            variant="primary"
            onPress={() => {}}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
