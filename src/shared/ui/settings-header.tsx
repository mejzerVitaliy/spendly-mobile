import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors } from '@/shared/theme';

interface SettingsHeaderProps {
  title: string;
  description?: string;
}

export function SettingsHeader({ title, description }: SettingsHeaderProps) {
  const router = useRouter();

  return (
    <View style={{ marginBottom: 24 }}>
      <View className='flex-row items-center gap-3 mb-4'>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 20,
            opacity: pressed ? 0.6 : 1,
            alignSelf: 'flex-start',
          })}
        >
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              backgroundColor: colors.glass.background,
              borderWidth: 1,
              borderColor: colors.border,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 8,
            }}
          >
            <Ionicons name="chevron-back" size={18} color={colors.mutedForeground} />
          </View>
        </Pressable>

        <Text style={{ fontSize: 30, fontWeight: '700', color: colors.foreground, marginBottom: 4 }}>
          {title}
        </Text>
      </View>
      
      {description && (
        <Text style={{ fontSize: 14, color: colors.mutedForeground, lineHeight: 20 }}>
          {description}
        </Text>
      )}
    </View>
  );
}
