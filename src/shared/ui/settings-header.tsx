import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface SettingsHeaderProps {
  title: string;
  description?: string;
}

export function SettingsHeader({ title, description }: SettingsHeaderProps) {
  const router = useRouter();

  return (
    <View className="mb-6">
      <Pressable
        onPress={() => router.back()}
        className="flex-row items-center mb-4 active:opacity-70"
      >
        <Ionicons name="arrow-back" size={24} color="#64748b" />
        <Text className="text-base text-muted-foreground ml-2">Back to Settings</Text>
      </Pressable>
      
      <Text className="text-3xl font-bold text-foreground mb-2">{title}</Text>
      {description && (
        <Text className="text-muted-foreground">{description}</Text>
      )}
    </View>
  );
}
