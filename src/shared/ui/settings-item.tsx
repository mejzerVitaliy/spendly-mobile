import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/shared/theme';

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
  hideDivider = false,
}: SettingsItemProps) {
  return (
    <View>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        className={`flex-row items-center px-4 py-3.5 gap-3 ${disabled ? 'opacity-50' : 'active:bg-border/50'}`}
      >
        {icon && (
          <View className="w-10 h-10 rounded-xl items-center justify-center bg-white/[0.05] border border-white/[0.08]">
            <Ionicons name={icon} size={20} color={colors.mutedForeground} />
          </View>
        )}

        <View className="flex-1">
          <Text className="text-base font-semibold text-foreground">{title}</Text>
        </View>

        {showChevron && !disabled && (
          <Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} />
        )}
      </Pressable>
      {!hideDivider && <View className="h-px bg-border" />}
    </View>
  );
}
