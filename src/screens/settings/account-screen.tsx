import { SettingsHeader, Input, Button, Separator } from '@/shared/ui';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function AccountScreen() {
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
            <Text className="text-sm font-medium text-foreground mb-2">Full Name</Text>
            <Input 
              placeholder="Enter your full name"
              value=""
            />
          </View>

          <Separator className="my-4" />

          <View className="mb-4">
            <Text className="text-sm font-medium text-foreground mb-2">Email</Text>
            <Input 
              placeholder="Enter your email"
              value=""
              keyboardType="email-address"
            />
          </View>

          <Separator className="my-4" />

          <View className="mb-4">
            <Text className="text-sm font-medium text-foreground mb-2">Phone Number</Text>
            <Input 
              placeholder="Enter your phone number"
              value=""
              keyboardType="phone-pad"
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
