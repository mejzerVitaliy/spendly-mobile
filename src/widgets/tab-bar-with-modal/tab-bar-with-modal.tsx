import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { TabBar } from '@/shared/ui/tab-bar';
import { BottomSheet, type BottomSheetRef } from '@/shared/ui';
import { CreateTransactionForm } from '@/features/create-transaction/manually/ui';
import { CreateTransactionText } from '@/features/create-transaction/typing/create-transaction-text';
import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';

const MENU_ITEMS = [
  {
    key: 'manual',
    icon: 'create-outline' as const,
    label: 'Manual',
    color: '#8B5CF6',
    disabled: false,
  },
  {
    key: 'text',
    icon: 'sparkles' as const,
    label: 'TextAI',
    color: '#10B981',
    disabled: false,
  },
  {
    key: 'voice',
    icon: 'mic-outline' as const,
    label: 'VoiceAI',
    color: '#F97316',
    disabled: true,
  },
] as const;

export function TabBarWithModal(props: BottomTabBarProps) {
  const [menuVisible, setMenuVisible] = useState(false);
  const manualRef = useRef<BottomSheetRef>(null);
  const textRef = useRef<BottomSheetRef>(null);

  const handleCreateTransaction = () => {
    setMenuVisible(true);
  };

  const handleMenuClose = () => {
    setMenuVisible(false);
  };

  const handleManual = () => {
    setMenuVisible(false);
    setTimeout(() => manualRef.current?.open(), 200);
  };

  const handleText = () => {
    setMenuVisible(false);
    setTimeout(() => textRef.current?.open(), 200);
  };

  const handleManualSuccess = () => {
    manualRef.current?.close();
  };

  const handleTextSuccess = () => {
    textRef.current?.close();
  };

  const handleItemPress = (key: string) => {
    if (key === 'manual') handleManual();
    else if (key === 'text') handleText();
  };

  return (
    <>
      <TabBar {...props} onCreateTransaction={handleCreateTransaction} />

      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={handleMenuClose}
        statusBarTranslucent
      >
        <BlurView intensity={60} tint="dark" style={{ flex: 1 }}>
          <Pressable style={{ flex: 1 }} onPress={handleMenuClose} />

          <View className='absolute bottom-[10%] left-1/2 -translate-x-1/2 flex flex-row gap-2'>
            {MENU_ITEMS.map((item, idx) => (
              <Pressable
                key={item.key}
                onPress={() => !item.disabled && handleItemPress(item.key)}
                className={`w-[80px] flex flex-col gap-1 items-center ${idx !== 1 && '!pt-7'}`}
              >
                <View
                  style={{
                    width: 68,
                    height: 68,
                    borderRadius: 34,
                    backgroundColor: `${item.color}20`,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name={item.icon} size={30} color={item.color} />
                </View>
                <View className='items-center'>
                  <Text className='text-white text-base font-semibold whitespace-nowrap'>
                    {item.label}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        </BlurView>
      </Modal>

      <BottomSheet ref={manualRef} snapPoints={['100%']}>
        <CreateTransactionForm onSuccess={handleManualSuccess} />
      </BottomSheet>

      <BottomSheet ref={textRef} enableDynamicSizing snapPoints={[]} keyboardBehavior="extend">
        <CreateTransactionText onSuccess={handleTextSuccess} />
      </BottomSheet>
    </>
  );
}
