import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import type { ToastConfig } from 'react-native-toast-message';
import { colors } from '@/shared/theme';

const ToastBase = ({
  text1,
  text2,
  iconName,
  accentColor,
}: {
  text1?: string;
  text2?: string;
  iconName: keyof typeof Ionicons.glyphMap;
  accentColor: string;
}) => (
  <View
    style={{
      width: '90%',
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 16,
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderWidth: 1,
      borderColor: `${accentColor}30`,
      gap: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.5,
      shadowRadius: 16,
      elevation: 12,
    }}
  >
    <View
      style={{
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: `${accentColor}18`,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        borderWidth: 1,
        borderColor: `${accentColor}25`,
      }}
    >
      <Ionicons name={iconName} size={20} color={accentColor} />
    </View>

    <View style={{ flex: 1 }}>
      {text1 && (
        <Text
          style={{
            color: colors.foreground,
            fontSize: 14,
            fontWeight: '700',
            marginBottom: text2 ? 2 : 0,
          }}
          numberOfLines={1}
        >
          {text1}
        </Text>
      )}
      {text2 && (
        <Text
          style={{ color: colors.mutedForeground, fontSize: 13 }}
          numberOfLines={2}
        >
          {text2}
        </Text>
      )}
    </View>
  </View>
);

export const toastConfig: ToastConfig = {
  success: ({ text1, text2 }) => (
    <ToastBase text1={text1} text2={text2} iconName="checkmark-circle" accentColor={colors.success} />
  ),
  error: ({ text1, text2 }) => (
    <ToastBase text1={text1} text2={text2} iconName="alert-circle" accentColor={colors.destructive} />
  ),
  info: ({ text1, text2 }) => (
    <ToastBase text1={text1} text2={text2} iconName="information-circle" accentColor={colors.primary} />
  ),
};
