import { Stack } from 'expo-router';

export default function SettingsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="account" />
      <Stack.Screen name="categories" />
      <Stack.Screen name="currencies" />
      <Stack.Screen name="security" />
      <Stack.Screen name="data-storage" />
      <Stack.Screen name="support-about" />
    </Stack>
  );
}
