import { TabBarWithModal } from '@/widgets/tab-bar-with-modal';
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function TabsLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        animation: 'none',
      }}
      tabBar={(props) => <TabBarWithModal {...props} />}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.home'),
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: t('tabs.analytics'),
        }}
      />
      <Tabs.Screen
        name="wallets"
        options={{
          title: t('tabs.wallets'),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('tabs.settings'),
        }}
      />
    </Tabs>
  );
}
