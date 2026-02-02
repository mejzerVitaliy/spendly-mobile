import { SettingsHeader, Input, Button, Separator } from '@/shared/ui';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function DataStorageScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1">
        <View className="px-5 py-4">
          <SettingsHeader 
            title="Data & Storage" 
            description="Manage your balance and export data"
          />

          <Text className="text-xs font-semibold text-muted-foreground uppercase mb-3">
            Current Balance
          </Text>
            
          <View className="mb-4">
            <Text className="text-sm text-muted-foreground mb-2">Set your current balance</Text>
            <Input 
              placeholder="Enter amount"
              value=""
              keyboardType="decimal-pad"
            />
          </View>

          <Button 
            title="Update Balance" 
            variant="primary"
            onPress={() => {}}
            className="mb-8"
          />

          <Text className="text-xs font-semibold text-muted-foreground uppercase mb-3">
            Export Data
          </Text>
            
          <View className="py-3">
            <Text className="text-base font-semibold text-foreground mb-2">
              Export Transactions to CSV
            </Text>
            <Text className="text-sm text-muted-foreground mb-4">
              Download all your transactions in CSV format
            </Text>
            <Button 
              title="Export to CSV" 
              variant="outline"
              onPress={() => {}}
            />
          </View>

          <Separator className="my-4" />

          <View className="py-3">
            <Text className="text-base font-semibold text-foreground mb-2">
              Export All Data
            </Text>
            <Text className="text-sm text-muted-foreground mb-4">
              Download all your data including transactions, categories, and settings
            </Text>
            <Button 
              title="Export All Data" 
              variant="outline"
              onPress={() => {}}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
