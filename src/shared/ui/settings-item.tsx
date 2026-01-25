import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SettingsItemProps {
  title: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  disabled?: boolean;
  showChevron?: boolean;
  hideDivider?: boolean;
}

export function SettingsItem({
  title,
  icon,
  onPress,
  disabled = false,
  showChevron = true,
}: SettingsItemProps) {
  return (
    <View>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        className={`flex-row items-center px-4 py-6 border-b border-border ${
          disabled ? 'opacity-50' : 'active:bg-border/50'
        }`}
      >
        {icon && (
          <View className="mr-4">
            <Ionicons name={icon} size={24} color="#64748b" />
          </View>
        )}
        
        <View className="flex-1">
          <Text className="text-base font-semibold text-foreground">
            {title}
          </Text>
        </View>
        
        {showChevron && !disabled && (
          <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
        )}
      </Pressable>
    </View>
  );
}
