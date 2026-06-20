import { useNotificationsStore } from '@/shared/stores/notifications';
import { colors } from '@/shared/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

export function AppHeader() {
  const unreadCount = useNotificationsStore((s) => s.notifications.filter((n) => !n.read).length);

  return (
    <View className="flex-row items-center justify-between px-5 pt-4">
      <View className="flex-row items-center gap-1.5">
        <Text className="text-[24px] font-bold text-foreground tracking-tight">
          Spendly{' '}
          <Text style={{ color: colors.primary }}>AI</Text>
        </Text>
      </View>

      <Pressable
        onPress={() => router.push('/notifications' as any)}
        className="w-10 h-10 rounded-full items-center justify-center active:opacity-60"
        style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
      >
        <Ionicons name="notifications-outline" size={20} color={colors.foreground} />
        {unreadCount > 0 && (
          <View
            className="absolute top-1.5 right-1.5 min-w-[16px] h-4 rounded-full bg-primary items-center justify-center px-1"
          >
            <Text className="text-[9px] font-bold text-background">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Text>
          </View>
        )}
      </Pressable>
    </View>
  );
}
