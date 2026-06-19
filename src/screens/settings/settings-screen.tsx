import { SettingsItem } from '@/shared/ui';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function SettingsScreen() {
  const router = useRouter();
  const { t } = useTranslation();

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
            title={t('settings.supportAbout')}
            icon="information-circle-outline"
            onPress={() => router.push('/settings/support-about')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
