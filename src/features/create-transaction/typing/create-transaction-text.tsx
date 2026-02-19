import { useTransactions } from '@/shared/hooks/transactions/use-transactions';
import { useState } from 'react';
import { ActivityIndicator, Keyboard, Pressable, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

interface CreateTransactionTextProps {
  onSuccess?: () => void;
}

const CreateTransactionText = ({ onSuccess }: CreateTransactionTextProps) => {
  const [text, setText] = useState('');
  const { parseTextMutation } = useTransactions();

  const handleSubmit = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    Keyboard.dismiss();

    try {
      const result = await parseTextMutation.mutateAsync(trimmed);
      const count = result.data.length;
      setText('');
      onSuccess?.();
      Toast.show({
        type: 'success',
        text1: 'Transactions created',
        text2: `${count} transaction${count > 1 ? 's' : ''} added successfully`,
      });
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      const message = err?.response?.data?.message ?? 'Failed to create transaction. Please try again.';
      Toast.show({
        type: 'error',
        text1: 'Could not create transaction',
        text2: message,
      });
    }
  };

  return (
    <View className="px-5 pt-4 pb-6">
      <Text className="text-lg font-bold text-foreground mb-1">
        Describe your transaction
      </Text>
      <Text className="text-sm text-muted-foreground mb-4">
        e.g. &quot;Spent 200 UAH on groceries yesterday&quot;
      </Text>

      <View className="flex-row items-center gap-3">
        <TextInput
          style={{ height: 56 }}
          className="flex-1 bg-card text-foreground text-base rounded-xl px-4 border border-border"
          placeholder="What did you spend or earn?"
          placeholderTextColor="#6B7280"
          value={text}
          onChangeText={setText}
          editable={!parseTextMutation.isPending}
          autoFocus
          returnKeyType="done"
          blurOnSubmit
          onSubmitEditing={Keyboard.dismiss}
          multiline={false}
        />

        <Pressable
          style={{ height: 56, width: 56 }}
          className={`rounded-xl items-center justify-center ${
            !text.trim() || parseTextMutation.isPending
              ? 'bg-primary/50'
              : 'bg-primary active:opacity-90'
          }`}
          disabled={!text.trim() || parseTextMutation.isPending}
          onPress={handleSubmit}
        >
          {parseTextMutation.isPending ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Ionicons name="sparkles" size={22} color="#ffffff" />
          )}
        </Pressable>
      </View>
    </View>
  );
};

export { CreateTransactionText };
