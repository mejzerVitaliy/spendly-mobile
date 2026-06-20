import { SettingsItem } from '@/shared/ui';
import { useNotificationsStore } from '@/shared/stores/notifications';
import { notificationService } from '@/shared/services/notifications';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScrollView, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/shared/theme';

export function SettingsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { pushNotificationsEnabled, permissionGranted } = useNotificationsStore();

  const handlePushToggle = (value: boolean) => {
    if (value) {
      notificationService.enablePush(t as any);
    } else {
      notificationService.disablePush();
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "left", "right"]}>
      <ScrollView className="flex-1">
        <View className="px-5 py-4">
          <Text className="text-3xl font-bold text-foreground mb-2">{t('settings.title')}</Text>
          <Text className="text-muted-foreground mb-6">{t('settings.subtitle')}</Text>
        </View>

        <View className="w-full">
          <SettingsItem
            title={t('settings.account')}
            icon="person-outline"
            onPress={() => router.push('/settings/account')}
          />

          <SettingsItem
            title={t('settings.categories')}
            icon="grid-outline"
            onPress={() => router.push('/settings/categories')}
          />

          <SettingsItem
            title={t('settings.currencies')}
            icon="cash-outline"
            onPress={() => router.push('/settings/currencies')}
          />

          <SettingsItem
            title={t('settings.language')}
            icon="language-outline"
            onPress={() => router.push('/settings/language' as any)}
          />

          <SettingsItem
            title={t('settings.limits')}
            icon="speedometer-outline"
            onPress={() => router.push('/settings/limits' as any)}
          />

          {/* Push notifications toggle */}
          <View className="flex-row items-center px-4 py-5 border-b border-border">
            <View className="mr-4">
              <Ionicons name="notifications-outline" size={24} color="#64748b" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-foreground">{t('settings.pushNotifications')}</Text>
              {!permissionGranted && (
                <Text className="text-xs text-muted-foreground mt-0.5">{t('settings.pushPermissionDenied')}</Text>
              )}
            </View>
            <Switch
              value={pushNotificationsEnabled && permissionGranted}
              onValueChange={handlePushToggle}
              disabled={!permissionGranted}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#fff"
            />
          </View>

          <SettingsItem
            title={t('settings.supportAbout')}
            icon="information-circle-outline"
            onPress={() => router.push('/settings/support-about')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
