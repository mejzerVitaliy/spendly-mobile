import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import type { ToastConfig } from 'react-native-toast-message';

const ToastBase = ({
  text1,
  text2,
  iconName,
  accentColor,
  borderColor,
}: {
  text1?: string;
  text2?: string;
  iconName: keyof typeof Ionicons.glyphMap;
  accentColor: string;
  borderColor: string;
}) => (
  <View
    style={{
      width: '90%',
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#1a1033',
      borderRadius: 16,
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderWidth: 1,
      borderColor,
      gap: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    }}
  >
    <View
      style={{
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: `${accentColor}20`,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Ionicons name={iconName} size={20} color={accentColor} />
    </View>

    <View style={{ flex: 1 }}>
      {text1 && (
        <Text
          style={{
            color: '#F9FAFB',
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
          style={{ color: '#9CA3AF', fontSize: 13, fontWeight: '400' }}
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
    <ToastBase
      text1={text1}
      text2={text2}
      iconName="checkmark-circle"
      accentColor="#8B5CF6"
      borderColor="rgba(139,92,246,0.3)"
    />
  ),
  error: ({ text1, text2 }) => (
    <ToastBase
      text1={text1}
      text2={text2}
      iconName="alert-circle"
      accentColor="#EF4444"
      borderColor="rgba(239,68,68,0.3)"
    />
  ),
  info: ({ text1, text2 }) => (
    <ToastBase
      text1={text1}
      text2={text2}
      iconName="information-circle"
      accentColor="#6366F1"
      borderColor="rgba(99,102,241,0.3)"
    />
  ),
};
