import { useState } from 'react';
import { Modal, Pressable, Text, TextInput, View, ScrollView, FlatList, Dimensions } from 'react-native';
import Toast from 'react-native-toast-message';
import { NumericKeyboard } from '@/shared/ui';
import { WalletType } from '@/shared/types';
import { useCurrencies, useWallets } from '@/shared/hooks';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const { getAllQuery } = useCurrencies();
  const [name, setName] = useState('');
  const [currencyCode, setCurrencyCode] = useState('USD');
  const [type, setType] = useState<WalletType>('CASH');
  const [initialBalance, setInitialBalance] = useState('');
  const [isCurrencyPickerOpen, setIsCurrencyPickerOpen] = useState(false);
  const [currencySearch, setCurrencySearch] = useState('');
  const [balanceFocused, setBalanceFocused] = useState(false);
  const insets = useSafeAreaInsets();
  const screenHeight = Dimensions.get('window').height;

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
      handleClose();
    } catch {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to create wallet' });
    }
  };

  const handleClose = () => {
    setName('');
    setCurrencyCode('USD');
    setType('CASH');
    setInitialBalance('');
    setIsCurrencyPickerOpen(false);
    setCurrencySearch('');
    onClose();
  };

  const filteredCurrencies = (() => {
  const allCurrencies = getAllQuery.data?.data || [];
  
  const filtered = allCurrencies.filter((currency) =>
    currency.code.toLowerCase().includes(currencySearch.toLowerCase()) ||
    currency.name.toLowerCase().includes(currencySearch.toLowerCase())
  );
  
  // Sort alphabetically by code
  return filtered.sort((a, b) => a.code.localeCompare(b.code));
})();

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-background rounded-t-3xl p-5 max-h-[90%]">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-xl font-bold text-foreground">Create Wallet</Text>
            <Pressable onPress={handleClose}>
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

            <Text className="text-foreground font-medium mb-2">Currency</Text>
            <Pressable
              onPress={() => setIsCurrencyPickerOpen(true)}
              className="bg-card border border-border rounded-xl p-4 mb-4 flex-row justify-between items-center"
            >
              <Text className="text-foreground">{currencyCode}</Text>
              <Text className="text-muted-foreground">▼</Text>
            </Pressable>

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
              value={initialBalance}
              onChangeText={setInitialBalance}
              placeholder="0.00"
              placeholderTextColor="#666"
              showSoftInputOnFocus={false}
              onFocus={() => setBalanceFocused(true)}
              onBlur={() => setBalanceFocused(false)}
              className="bg-card border border-border rounded-xl p-4 text-foreground mb-2"
            />
            {balanceFocused && (
              <NumericKeyboard
                onKeyPress={(key) => {
                  if (key === '.' && initialBalance.includes('.')) return;
                  if (key === '.' && initialBalance === '') { setInitialBalance('0.'); return; }
                  setInitialBalance(initialBalance + key);
                }}
                onDelete={() => setInitialBalance(initialBalance.slice(0, -1))}
              />
            )}
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
      </View>

      {/* Currency Picker Modal */}
      <Modal visible={isCurrencyPickerOpen} animationType="slide" transparent>
        <Pressable 
          className="flex-1 bg-black/50" 
          onPress={() => setIsCurrencyPickerOpen(false)}
        >
          <View className="flex-1 justify-end">
            <Pressable 
              className="bg-background rounded-t-3xl" 
              style={{ 
                paddingBottom: insets.bottom,
                height: screenHeight * 0.7
              }}
            >
              <View className="p-5 flex-1">
                <View className="flex-row justify-between items-center mb-4">
                  <Text className="text-xl font-bold text-foreground">Select Currency</Text>
                  <Pressable onPress={() => setIsCurrencyPickerOpen(false)}>
                    <Text className="text-muted-foreground text-lg">✕</Text>
                  </Pressable>
                </View>

                <TextInput
                  value={currencySearch}
                  onChangeText={setCurrencySearch}
                  placeholder="Search currency..."
                  placeholderTextColor="#666"
                  className="bg-card border border-border rounded-xl p-4 text-foreground mb-4"
                />

                <FlatList
                  data={filteredCurrencies}
                  keyExtractor={(item) => item.code}
                  showsVerticalScrollIndicator={false}
                  maxToRenderPerBatch={20}
                  initialNumToRender={15}
                  windowSize={10}
                  className="flex-1"
                  renderItem={({ item }) => {
                    const isSelected = currencyCode === item.code;
                    
                    return (
                      <Pressable
                        onPress={() => {
                          setCurrencyCode(item.code);
                          setIsCurrencyPickerOpen(false);
                          setCurrencySearch('');
                        }}
                        className={`bg-card border rounded-lg p-4 mb-2 flex-row justify-between items-center ${
                          isSelected ? 'border-primary' : 'border-border'
                        }`}
                      >
                        <View className="flex-1">
                          <Text className="text-foreground font-medium">{item.code}</Text>
                          <Text className="text-muted-foreground text-sm">{item.name}</Text>
                        </View>
                        {isSelected && (
                          <Text className="text-primary text-lg">✓</Text>
                        )}
                      </Pressable>
                    );
                  }}
                  ListEmptyComponent={
                    <View className="py-8 items-center">
                      <Text className="text-muted-foreground">No currencies found</Text>
                    </View>
                  }
                />
              </View>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </Modal>
  );
}
