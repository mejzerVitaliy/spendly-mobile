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
      className="w-full rounded-3xl p-6 border"
      style={{
        backgroundColor: colors.card,
        borderColor: colors.glass.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.6,
        shadowRadius: 40,
        elevation: 20,
      }}
    >
      <Text className="text-[18px] font-bold text-foreground mb-2">{title}</Text>
      <Text className="text-[14px] text-muted-foreground leading-5 mb-6">{message}</Text>

      <View className="flex-row gap-3">
        <Pressable
          onPress={onCancel}
          className="flex-1 py-[13px] rounded-2xl items-center border active:opacity-70"
          style={{ backgroundColor: colors.secondary, borderColor: colors.border }}
        >
          <Text className="text-[15px] font-semibold text-muted-foreground">{cancelText}</Text>
        </Pressable>

        <Pressable
          onPress={onConfirm}
          className="flex-1 py-[13px] rounded-2xl items-center active:opacity-75"
          style={{ backgroundColor: destructive ? colors.destructive : colors.primary }}
        >
          <Text
            className="text-[15px] font-bold"
            style={{ color: destructive ? colors.destructiveForeground : colors.primaryForeground }}
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
          className="flex-1 items-center justify-center px-6"
          style={{ backgroundColor: colors.overlayLight }}
        >
          {dialogContent}
        </BlurView>
      ) : (
        <View
          className="flex-1 items-center justify-center px-6"
          style={{ backgroundColor: colors.overlay }}
        >
          {dialogContent}
        </View>
      )}
    </Modal>
  );
}
