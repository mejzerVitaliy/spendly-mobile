import { TabBarWithModal } from '@/widgets/tab-bar-with-modal';
import { Tabs } from 'expo-router';

export default function TabsLayout() {
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
          title: 'Home',
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analytics',
        }}
      />
      <Tabs.Screen
        name="wallets"
        options={{
          title: 'Wallets',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
        }}
      />
    </Tabs>
  );
}
