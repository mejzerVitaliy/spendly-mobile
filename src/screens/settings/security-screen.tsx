import { SettingsHeader, Input, Button, Separator } from '@/shared/ui';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function SecurityScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1">
        <View className="px-5 py-4">
          <SettingsHeader 
            title="Security" 
            description="Manage your password and security settings"
          />

          <Text className="text-xs font-semibold text-muted-foreground uppercase mb-3">
            Change Password
          </Text>
            
          <View className="mb-4">
            <Text className="text-sm font-medium text-foreground mb-2">Current Password</Text>
            <Input 
              placeholder="Enter current password"
              value=""
              type="password"
            />
          </View>

          <Separator className="my-4" />

          <View className="mb-4">
            <Text className="text-sm font-medium text-foreground mb-2">New Password</Text>
            <Input 
              placeholder="Enter new password"
              value=""
              type="password"
            />
          </View>

          <Separator className="my-4" />

          <View className="mb-4">
            <Text className="text-sm font-medium text-foreground mb-2">Confirm New Password</Text>
            <Input 
              placeholder="Confirm new password"
              value=""
              type="password"
            />
          </View>

          <Button 
            title="Update Password" 
            variant="primary"
            onPress={() => {}}
            className="mt-2 mb-8"
          />

          <Text className="text-xs font-semibold text-muted-foreground uppercase mb-3">
            Login History
          </Text>
            
          <View className="py-3">
            <Text className="text-base font-semibold text-foreground">Last Login</Text>
            <Text className="text-sm text-muted-foreground mt-1">
              Jan 10, 2026 at 6:28 PM
            </Text>
            <Text className="text-sm text-muted-foreground">
              Location: Kyiv, Ukraine
            </Text>
          </View>

          <Separator />

          <View className="py-3">
            <Text className="text-base font-semibold text-foreground">Previous Login</Text>
            <Text className="text-sm text-muted-foreground mt-1">
              Jan 9, 2026 at 10:15 AM
            </Text>
            <Text className="text-sm text-muted-foreground">
              Location: Kyiv, Ukraine
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
