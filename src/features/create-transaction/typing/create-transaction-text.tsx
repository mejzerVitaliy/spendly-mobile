import { useTransactions } from '@/shared/hooks/transactions/use-transactions';
import { ParsedTransactionPreview } from '@/shared/types';
import { useState } from 'react';
import { ActivityIndicator, Keyboard, Pressable, Text, View } from 'react-native';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { colors } from '@/shared/theme';
import { useTranslation } from 'react-i18next';
import { AIConfirmationDialog } from '@/shared/ui/ai-confirmation-dialog';

interface CreateTransactionTextProps {
  onSuccess?: () => void;
}

const CreateTransactionText = ({ onSuccess }: CreateTransactionTextProps) => {
  const [text, setText] = useState('');
  const [preview, setPreview] = useState<ParsedTransactionPreview[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const { previewTextMutation, createFromPreviewMutation } = useTransactions();
  const { t } = useTranslation();

  const handleSubmit = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    // Don't call Keyboard.dismiss() here — programmatic dismiss breaks
    // keyboardBlurBehavior="restore" on the parent BottomSheet.
    // Pressing the Pressable button already removes focus from the input.

    try {
      const result = await previewTextMutation.mutateAsync(trimmed);
      setPreview(result.data.transactions);
      setShowConfirm(true);
    } catch {
      Toast.show({
        type: 'error',
        text1: t('textAI.errorTitle'),
        text2: t('textAI.errorDefault'),
      });
    }
  };

  const handleConfirm = async ({ isRecurring, recurringPeriod }: { isRecurring: boolean; recurringPeriod: import('@/shared/types/transactions/transactions').RecurringPeriod | null }) => {
    try {
      await createFromPreviewMutation.mutateAsync({ previews: preview, isRecurring, recurringPeriod });
      const count = preview.length;
      setShowConfirm(false);
      setPreview([]);
      setText('');
      onSuccess?.();
      Toast.show({
        type: 'success',
        text1: t('textAI.created'),
        text2: t(count === 1 ? 'textAI.createdDesc_one' : 'textAI.createdDesc_other', { count }),
      });
    } catch {
      Toast.show({
        type: 'error',
        text1: t('textAI.errorTitle'),
        text2: t('textAI.errorDefault'),
      });
    }
  };

  const handleCancel = () => {
    setShowConfirm(false);
    setPreview([]);
  };

  const isPreviewing = previewTextMutation.isPending;

  return (
    <>
      <View className="px-5 pt-4 pb-6">
        <Text className="text-lg font-bold text-foreground mb-1">
          {t('textAI.title')}
        </Text>
        <Text className="text-sm text-muted-foreground mb-4">
          {t('textAI.subtitle')}
        </Text>

        <View className="flex-row items-center gap-3">
          <BottomSheetTextInput
            style={{ height: 56, flex: 1, backgroundColor: 'transparent', fontSize: 16, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, borderColor: colors.border, color: colors.foreground }}
            placeholder={t('textAI.placeholder')}
            placeholderTextColor={colors.mutedForeground}
            value={text}
            onChangeText={setText}
            editable={!isPreviewing}
            autoFocus
            returnKeyType="done"
            blurOnSubmit
            onSubmitEditing={Keyboard.dismiss}
            multiline={false}
          />

          <Pressable
            style={{ height: 56, width: 56 }}
            className={`rounded-xl items-center justify-center ${
              !text.trim() || isPreviewing
                ? 'bg-primary/50'
                : 'bg-primary active:opacity-90'
            }`}
            disabled={!text.trim() || isPreviewing}
            onPress={handleSubmit}
          >
            {isPreviewing ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Ionicons name="sparkles" size={22} color="#ffffff" />
            )}
          </Pressable>
        </View>
      </View>

      <AIConfirmationDialog
        visible={showConfirm}
        transactions={preview}
        isCreating={createFromPreviewMutation.isPending}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        onEditSuccess={onSuccess}
      />
    </>
  );
};

export { CreateTransactionText };
