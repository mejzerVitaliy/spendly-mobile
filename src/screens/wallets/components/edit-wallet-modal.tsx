import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { BottomSheetScrollView, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomSheet } from '@/shared/ui';
import { WalletDto, WalletType } from '@/shared/types';
import { useWallets } from '@/shared/hooks';
import { colors } from '@/shared/theme';
import { Ionicons } from '@expo/vector-icons';

interface EditWalletModalProps {
  visible: boolean;
  wallet: WalletDto | null;
  onClose: () => void;
}

const WALLET_TYPES: { value: WalletType; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'CASH', label: 'Cash', icon: 'cash-outline' },
  { value: 'DEBIT_CARD', label: 'Debit', icon: 'card-outline' },
  { value: 'CREDIT_CARD', label: 'Credit', icon: 'card' },
  { value: 'SAVINGS', label: 'Savings', icon: 'save-outline' },
  { value: 'CUSTOM', label: 'Custom', icon: 'wallet-outline' },
];

export function EditWalletModal({ visible, wallet, onClose }: EditWalletModalProps) {
  const { updateMutation } = useWallets();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [type, setType] = useState<WalletType>('CASH');

  useEffect(() => {
    if (wallet) {
      setName(wallet.name);
      setType(wallet.type);
    }
  }, [wallet]);

  const handleSave = async () => {
    if (!wallet) return;
    if (!name.trim()) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Please enter a wallet name' });
      return;
    }
    try {
      await updateMutation.mutateAsync({ id: wallet.id, request: { name: name.trim(), type } });
      Toast.show({ type: 'success', text1: 'Saved', text2: 'Wallet updated successfully' });
      onClose();
    } catch {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to update wallet' });
    }
  };

  return (
    <BottomSheet
      open={visible}
      onOpenChange={(open) => { if (!open) onClose(); }}
      noWrapper
      keyboardBehavior="interactive"
      android_keyboardInputMode="adjustResize"
    >
      <BottomSheetScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Math.max(32, insets.bottom + 24) }}
      >
        <View className="px-5 pt-1.5">

          {/* Header */}
          <View className="flex-row justify-between items-center mb-7">
            <Text className="text-[20px] font-bold text-foreground">Edit Wallet</Text>
            <Pressable
              onPress={onClose}
              className="w-8 h-8 rounded-full bg-secondary border border-white/10 items-center justify-center active:opacity-70"
            >
              <Ionicons name="close" size={18} color={colors.mutedForeground} />
            </Pressable>
          </View>

          {/* Name */}
          <Text className="text-[12px] font-semibold text-muted-foreground uppercase tracking-widest mb-2.5">
            Wallet Name
          </Text>
          <BottomSheetTextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g. Main Card"
            placeholderTextColor={colors.mutedForeground}
            returnKeyType="done"
            style={{
              backgroundColor: colors.input,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.1)',
              borderRadius: 14,
              paddingHorizontal: 16,
              paddingVertical: 14,
              fontSize: 16,
              color: colors.foreground,
              marginBottom: 24,
            }}
          />

          {/* Type */}
          <Text className="text-[12px] font-semibold text-muted-foreground uppercase tracking-widest mb-2.5">
            Type
          </Text>
          <View className="flex-row flex-wrap gap-2 mb-8">
            {WALLET_TYPES.map((wt) => {
              const active = type === wt.value;
              return (
                <Pressable
                  key={wt.value}
                  onPress={() => setType(wt.value)}
                  className="flex-row items-center gap-[7px] px-3.5 py-2.5 rounded-2xl border active:opacity-75"
                  style={{
                    backgroundColor: active ? 'rgba(34,211,238,0.12)' : colors.secondary,
                    borderColor: active ? 'rgba(34,211,238,0.3)' : colors.border,
                  }}
                >
                  <Ionicons
                    name={wt.icon}
                    size={18}
                    color={active ? colors.primary : colors.mutedForeground}
                  />
                  <Text
                    className="text-[13px] font-semibold"
                    style={{ color: active ? colors.primary : colors.foreground }}
                  >
                    {wt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Save button */}
          <Pressable
            onPress={handleSave}
            disabled={updateMutation.isPending}
            className="bg-primary rounded-[18px] items-center py-[17px] active:opacity-75"
            style={{ opacity: updateMutation.isPending ? 0.7 : 1 }}
          >
            <Text className="text-[16px] font-bold text-primary-foreground">
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Text>
          </Pressable>

        </View>
      </BottomSheetScrollView>
    </BottomSheet>
  );
}
