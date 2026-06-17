import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomSheet, FormCurrencyPicker, NumericKeyboard, useNumericKeyboard } from '@/shared/ui';
import { WalletType } from '@/shared/types';
import { useWallets } from '@/shared/hooks';
import { useAuthStore } from '@/shared/stores';
import { useForm } from 'react-hook-form';
import { colors } from '@/shared/theme';
import { Ionicons } from '@expo/vector-icons';

interface CreateWalletModalProps {
  visible: boolean;
  onClose: () => void;
}

const WALLET_TYPES: { value: WalletType; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'CASH', label: 'Cash', icon: 'cash-outline' },
  { value: 'DEBIT_CARD', label: 'Debit', icon: 'card-outline' },
  { value: 'CREDIT_CARD', label: 'Credit', icon: 'card' },
  { value: 'SAVINGS', label: 'Savings', icon: 'save-outline' },
  { value: 'CUSTOM', label: 'Custom', icon: 'wallet-outline' },
];

export function CreateWalletModal({ visible, onClose }: CreateWalletModalProps) {
  const { createMutation } = useWallets();
  const insets = useSafeAreaInsets();
  const userMainCurrency = useAuthStore((state) => state.user?.mainCurrencyCode) ?? 'USD';
  const { control, watch, setValue } = useForm<{ currencyCode: string }>({
    defaultValues: { currencyCode: userMainCurrency },
  });

  const [name, setName] = useState('');
  const [type, setType] = useState<WalletType>('CASH');
  const [initialBalance, setInitialBalance] = useState('');
  const balanceKb = useNumericKeyboard();
  const currencyCode = watch('currencyCode');

  useEffect(() => {
    setValue('currencyCode', userMainCurrency);
  }, [userMainCurrency, setValue]);

  const resetFormState = () => {
    setName('');
    setValue('currencyCode', userMainCurrency);
    setType('CASH');
    setInitialBalance('');
    balanceKb.close();
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Please enter a wallet name' });
      return;
    }
    try {
      await createMutation.mutateAsync({
        name: name.trim(),
        currencyCode,
        type,
        initialBalance: initialBalance ? Math.round(parseFloat(initialBalance) * 100) : 0,
      });
      resetFormState();
      onClose();
    } catch {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to create wallet' });
    }
  };

  return (
    <BottomSheet
      open={visible}
      onOpenChange={(open) => {
        if (!open) { resetFormState(); onClose(); }
      }}
      noWrapper
      keyboardBehavior="interactive"
      android_keyboardInputMode="adjustResize"
    >
      <BottomSheetScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.container, { paddingBottom: Math.max(16, insets.bottom + 16) }]}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>New Wallet</Text>
          <Pressable
            onPress={() => { resetFormState(); onClose(); }}
            style={styles.closeBtn}
          >
            <Ionicons name="close" size={18} color={colors.mutedForeground} />
          </Pressable>
        </View>

        {/* Name */}
        <Text style={styles.label}>Wallet Name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="e.g. Main Card"
          placeholderTextColor={colors.mutedForeground}
          style={styles.textInput}
        />

        {/* Currency */}
        <FormCurrencyPicker control={control} name="currencyCode" label="Currency" />

        {/* Type */}
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
              <Text
                style={[
                  styles.typeBtnText,
                  { color: type === wt.value ? colors.primary : colors.foreground },
                ]}
              >
                {wt.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Initial balance */}
        <Text style={styles.label}>
          Initial Balance{' '}
          <Text style={{ color: colors.mutedForeground }}>(optional)</Text>
        </Text>
        <Pressable
          onPress={balanceKb.open}
          style={[styles.textInput, { marginBottom: 0, justifyContent: 'center' }]}
        >
          <Text style={{ fontSize: 16, color: initialBalance ? colors.foreground : colors.mutedForeground }}>
            {initialBalance || '0.00'}
          </Text>
        </Pressable>
        <NumericKeyboard
          visible={balanceKb.visible}
          value={initialBalance}
          onKeyPress={(key) => setInitialBalance(prev => prev + key)}
          onDelete={() => setInitialBalance(prev => prev.slice(0, -1))}
          onClose={balanceKb.close}
          onClosed={balanceKb.onClosed}
        />
        <View style={{ height: 24 }} />

        {/* Submit */}
        <Pressable
          onPress={handleCreate}
          disabled={createMutation.isPending}
          className="bg-primary active:opacity-80 p-4 rounded-2xl items-center"
        >
          <Text style={styles.submitText}>
            {createMutation.isPending ? 'Creating...' : 'Create Wallet'}
          </Text>
        </Pressable>
        <View style={{ height: 16 }} />
      </BottomSheetScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 16,
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
    marginBottom: 24,
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
  submitText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primaryForeground,
  },
});
