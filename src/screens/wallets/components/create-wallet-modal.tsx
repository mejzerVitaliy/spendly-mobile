import { useEffect, useRef, useState } from 'react';
import { Pressable, Text, TextInput, View, ScrollView } from 'react-native';
import Toast from 'react-native-toast-message';
import { BottomSheet, FormCurrencyPicker, NumericKeyboard } from '@/shared/ui';
import { WalletType } from '@/shared/types';
import { useWallets } from '@/shared/hooks';
import { useAuthStore } from '@/shared/stores';
import { useForm } from 'react-hook-form';

interface CreateWalletModalProps {
  visible: boolean;
  onClose: () => void;
}

const WALLET_TYPES: { value: WalletType; label: string }[] = [
  { value: 'CASH', label: 'Cash' },
  { value: 'DEBIT_CARD', label: 'Debit Card' },
  { value: 'CREDIT_CARD', label: 'Credit Card' },
  { value: 'SAVINGS', label: 'Savings' },
  { value: 'CUSTOM', label: 'Custom' },
];

export function CreateWalletModal({ visible, onClose }: CreateWalletModalProps) {
  const { createMutation } = useWallets();
  const userMainCurrency = useAuthStore((state) => state.user?.mainCurrencyCode) ?? 'USD';

  const { control, watch, setValue } = useForm<{ currencyCode: string }>({
    defaultValues: {
      currencyCode: userMainCurrency,
    },
  });

  const [name, setName] = useState('');
  const [type, setType] = useState<WalletType>('CASH');
  const [initialBalance, setInitialBalance] = useState('');
  const [balanceKeyboardVisible, setBalanceKeyboardVisible] = useState(false);
  const balanceInputRef = useRef<TextInput>(null);
  const currencyCode = watch('currencyCode');

  useEffect(() => {
    setValue('currencyCode', userMainCurrency);
  }, [userMainCurrency, setValue]);

  const resetFormState = () => {
    setName('');
    setValue('currencyCode', userMainCurrency);
    setType('CASH');
    setInitialBalance('');
    setBalanceKeyboardVisible(false);
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
    <>
      <BottomSheet
        open={visible}
        onOpenChange={(open) => {
          if (!open) {
            resetFormState();
            onClose();
          }
        }}
        keyboardBehavior="interactive"
        android_keyboardInputMode="adjustResize"
      >
        <View className="px-5 pt-2 pb-4">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-xl font-bold text-foreground">Create Wallet</Text>
            <Pressable
              onPress={() => {
                resetFormState();
                onClose();
              }}
            >
              <Text className="text-muted-foreground text-lg">✕</Text>
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text className="text-foreground font-medium mb-2">Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. Main Card"
              placeholderTextColor="#666"
              className="bg-card border border-border rounded-xl p-4 text-foreground mb-4"
            />

            <FormCurrencyPicker
              control={control}
              name="currencyCode"
              label="Currency"
            />

            <Text className="text-foreground font-medium mb-2">Type</Text>
            <View className="flex-row flex-wrap gap-2 mb-4">
              {WALLET_TYPES.map((wt) => (
                <Pressable
                  key={wt.value}
                  onPress={() => setType(wt.value)}
                  className={`px-4 py-2 rounded-lg ${
                    type === wt.value ? 'bg-primary' : 'bg-card border border-border'
                  }`}
                >
                  <Text
                    className={type === wt.value ? 'text-primary-foreground' : 'text-foreground'}
                  >
                    {wt.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text className="text-foreground font-medium mb-2">Initial Balance (optional)</Text>
            <TextInput
              ref={balanceInputRef}
              value={initialBalance}
              onChangeText={setInitialBalance}
              placeholder="0.00"
              placeholderTextColor="#666"
              showSoftInputOnFocus={false}
              onFocus={() => setBalanceKeyboardVisible(true)}
              className="bg-card border border-border rounded-xl p-4 text-foreground mb-2"
            />
            <NumericKeyboard
              visible={balanceKeyboardVisible}
              onKeyPress={(key) => {
                if (key === '.' && initialBalance.includes('.')) return;
                if (key === '.' && initialBalance === '') { setInitialBalance('0.'); return; }
                setInitialBalance(initialBalance + key);
              }}
              onDelete={() => setInitialBalance(initialBalance.slice(0, -1))}
              onConfirm={() => {
                setBalanceKeyboardVisible(false);
                balanceInputRef.current?.blur();
              }}
            />
            <View className="mb-4" />

            <Pressable
              onPress={handleCreate}
              disabled={createMutation.isPending}
              className={`bg-primary py-4 rounded-xl items-center mb-4 ${
                createMutation.isPending ? 'opacity-50' : ''
              }`}
            >
              <Text className="text-primary-foreground font-semibold text-lg">
                {createMutation.isPending ? 'Creating...' : 'Create Wallet'}
              </Text>
            </Pressable>
          </ScrollView>
        </View>
      </BottomSheet>
    </>
  );
}
