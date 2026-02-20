import { Modal, Pressable, Text, View } from 'react-native';

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
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.6)',
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 24,
        }}
      >
        <View
          style={{
            width: '100%',
            backgroundColor: '#1a1033',
            borderRadius: 20,
            padding: 24,
            borderWidth: 1,
            borderColor: 'rgba(139,92,246,0.2)',
          }}
        >
          <Text
            style={{
              color: '#F9FAFB',
              fontSize: 18,
              fontWeight: '700',
              marginBottom: 8,
            }}
          >
            {title}
          </Text>
          <Text
            style={{
              color: '#9CA3AF',
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
                paddingVertical: 12,
                borderRadius: 12,
                alignItems: 'center',
                backgroundColor: pressed ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.05)',
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.1)',
              })}
            >
              <Text style={{ color: '#9CA3AF', fontWeight: '600', fontSize: 15 }}>
                {cancelText}
              </Text>
            </Pressable>

            <Pressable
              onPress={onConfirm}
              style={({ pressed }) => ({
                flex: 1,
                paddingVertical: 12,
                borderRadius: 12,
                alignItems: 'center',
                backgroundColor: destructive
                  ? pressed ? '#dc2626' : '#EF4444'
                  : pressed ? '#7c3aed' : '#8B5CF6',
              })}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 15 }}>
                {confirmText}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
