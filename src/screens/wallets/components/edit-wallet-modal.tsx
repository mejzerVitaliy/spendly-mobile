import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
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
      snapPoints={['75%']}
      noWrapper
      keyboardBehavior="interactive"
      android_keyboardInputMode="adjustResize"
    >
      <BottomSheetScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.container, { paddingBottom: Math.max(32, insets.bottom + 24) }]}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Edit Wallet</Text>
          <Pressable onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={18} color={colors.mutedForeground} />
          </Pressable>
        </View>

        <Text style={styles.label}>Wallet Name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="e.g. Main Card"
          placeholderTextColor={colors.mutedForeground}
          style={styles.textInput}
          returnKeyType="done"
        />

        <Text style={styles.label}>Type</Text>
        <View style={styles.typeRow}>
          {WALLET_TYPES.map((wt) => (
            <Pressable
              key={wt.value}
              onPress={() => setType(wt.value)}
              style={[
                styles.typeBtn,
                type === wt.value
                  ? { backgroundColor: 'rgba(34,211,238,0.12)', borderColor: 'rgba(34,211,238,0.3)' }
                  : { backgroundColor: colors.secondary, borderColor: colors.border },
              ]}
            >
              <Ionicons
                name={wt.icon}
                size={18}
                color={type === wt.value ? colors.primary : colors.mutedForeground}
              />
              <Text style={[styles.typeBtnText, { color: type === wt.value ? colors.primary : colors.foreground }]}>
                {wt.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          onPress={handleSave}
          disabled={updateMutation.isPending}
          style={({ pressed }) => [
            styles.submitBtn,
            { opacity: updateMutation.isPending || pressed ? 0.7 : 1 },
          ]}
        >
          <Text style={styles.submitText}>
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Text>
        </Pressable>
      </BottomSheetScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.foreground,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.secondary,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.mutedForeground,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  textInput: {
    backgroundColor: colors.input,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.foreground,
    marginBottom: 24,
  },
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 32,
  },
  typeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  typeBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  submitBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 17,
    borderRadius: 18,
    alignItems: 'center',
  },
  submitText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primaryForeground,
  },
});
