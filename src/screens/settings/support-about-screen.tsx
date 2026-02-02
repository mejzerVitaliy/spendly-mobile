import { SettingsHeader, Button, Separator } from '@/shared/ui';
import { ScrollView, Text, View, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function SupportAboutScreen() {
  const handleOpenLink = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1">
        <View className="px-5 py-4">
          <SettingsHeader 
            title="Support & About" 
            description="App information and support"
          />

          <Text className="text-xs font-semibold text-muted-foreground uppercase mb-3">
            App Information
          </Text>
            
          <View className="flex-row items-center justify-between py-3">
            <Text className="text-base text-foreground">App Version</Text>
            <Text className="text-base font-semibold text-foreground">1.0.0</Text>
          </View>

          <Separator />

          <View className="flex-row items-center justify-between py-3 mb-6">
            <Text className="text-base text-foreground">Build Number</Text>
            <Text className="text-base font-semibold text-foreground">100</Text>
          </View>

          <Text className="text-xs font-semibold text-muted-foreground uppercase mb-3">
            Support
          </Text>
            
          <View className="py-3">
            <Text className="text-base font-semibold text-foreground mb-2">
              Contact Support
            </Text>
            <Text className="text-sm text-muted-foreground mb-4">
              Get help with your account or report issues
            </Text>
            <Button 
              title="Email Support" 
              variant="outline"
              onPress={() => handleOpenLink('mailto:support@spendly.app')}
            />
          </View>

          <Separator className="my-4" />

          <View className="py-3 mb-6">
            <Text className="text-base font-semibold text-foreground mb-2">
              FAQ & Help Center
            </Text>
            <Text className="text-sm text-muted-foreground mb-4">
              Find answers to common questions
            </Text>
            <Button 
              title="Visit Help Center" 
              variant="outline"
              onPress={() => handleOpenLink('https://spendly.app/help')}
            />
          </View>

          <Text className="text-xs font-semibold text-muted-foreground uppercase mb-3">
            Legal
          </Text>
            
          <View className="py-3">
            <Text className="text-base font-semibold text-foreground mb-2">
              Privacy Policy
            </Text>
            <Text className="text-sm text-muted-foreground mb-4">
              Learn how we protect your data
            </Text>
            <Button 
              title="Read Privacy Policy" 
              variant="outline"
              onPress={() => handleOpenLink('https://spendly.app/privacy')}
            />
          </View>

          <Separator className="my-4" />

          <View className="py-3">
            <Text className="text-base font-semibold text-foreground mb-2">
              Terms of Service
            </Text>
            <Text className="text-sm text-muted-foreground mb-4">
              Review our terms and conditions
            </Text>
            <Button 
              title="Read Terms of Service" 
              variant="outline"
              onPress={() => handleOpenLink('https://spendly.app/terms')}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
