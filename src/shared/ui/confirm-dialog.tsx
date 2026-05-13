import { BlurView } from 'expo-blur';
import { Modal, Platform, Pressable, Text, View } from 'react-native';
import { colors } from '@/shared/theme';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogContent = (
    <View
      style={{
        width: '100%',
        backgroundColor: colors.card,
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: colors.glass.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.6,
        shadowRadius: 40,
        elevation: 20,
      }}
    >
      <Text
        style={{
          color: colors.foreground,
          fontSize: 18,
          fontWeight: '700',
          marginBottom: 8,
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          color: colors.mutedForeground,
          fontSize: 14,
          lineHeight: 20,
          marginBottom: 24,
        }}
      >
        {message}
      </Text>

      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Pressable
          onPress={onCancel}
          style={({ pressed }) => ({
            flex: 1,
            paddingVertical: 13,
            borderRadius: 14,
            alignItems: 'center',
            backgroundColor: pressed ? colors.border : colors.secondary,
            borderWidth: 1,
            borderColor: colors.border,
          })}
        >
          <Text style={{ color: colors.mutedForeground, fontWeight: '600', fontSize: 15 }}>
            {cancelText}
          </Text>
        </Pressable>

        <Pressable
          onPress={onConfirm}
          style={({ pressed }) => ({
            flex: 1,
            paddingVertical: 13,
            borderRadius: 14,
            alignItems: 'center',
            backgroundColor: destructive
              ? pressed ? '#dc2626' : colors.destructive
              : pressed
              ? '#1CBFD6'
              : colors.primary,
          })}
        >
          <Text
            style={{
              color: destructive ? colors.destructiveForeground : colors.primaryForeground,
              fontWeight: '700',
              fontSize: 15,
            }}
          >
            {confirmText}
          </Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      {Platform.OS === 'ios' ? (
        <BlurView
          intensity={40}
          tint="systemUltraThinMaterialDark"
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 24,
            backgroundColor: colors.overlayLight,
          }}
        >
          {dialogContent}
        </BlurView>
      ) : (
        <View
          style={{
            flex: 1,
            backgroundColor: colors.overlay,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 24,
          }}
        >
          {dialogContent}
        </View>
      )}
    </Modal>
  );
}
