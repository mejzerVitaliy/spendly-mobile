import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { TabBar } from '@/shared/ui/tab-bar';
import { BottomSheet, type BottomSheetRef } from '@/shared/ui';
import { CreateTransactionForm } from '@/features/create-transaction/manually/ui';
import { CreateTransactionText } from '@/features/create-transaction/typing/create-transaction-text';
import { CreateTransactionVoice } from '@/features/create-transaction/voice/create-transaction-voice';
import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import { Modal, Platform, Pressable, Text, View } from 'react-native';
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
    disabled: false,
  },
] as const;

function MenuItems({ onItemPress }: { onItemPress: (key: string) => void; onClose: () => void }) {
  return (
    <View style={{ position: 'absolute', bottom: '10%', left: '50%', transform: [{ translateX: -120 }], flexDirection: 'row', gap: 8 }}>
      {MENU_ITEMS.map((item, idx) => (
        <Pressable
          key={item.key}
          onPress={() => !item.disabled && onItemPress(item.key)}
          style={{ width: 80, flexDirection: 'column', gap: 4, alignItems: 'center', paddingTop: idx !== 1 ? 28 : 0 }}
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
          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>
              {item.label}
            </Text>
          </View>
        </Pressable>
      ))}
    </View>
  );
}

export function TabBarWithModal(props: BottomTabBarProps) {
  const [menuVisible, setMenuVisible] = useState(false);
  const manualRef = useRef<BottomSheetRef>(null);
  const textRef = useRef<BottomSheetRef>(null);
  const voiceRef = useRef<BottomSheetRef>(null);

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

  const handleVoice = () => {
    setMenuVisible(false);
    setTimeout(() => voiceRef.current?.open(), 200);
  };

  const handleManualSuccess = () => {
    manualRef.current?.close();
  };

  const handleTextSuccess = () => {
    textRef.current?.close();
  };

  const handleVoiceSuccess = () => {
    voiceRef.current?.close();
  };

  const handleItemPress = (key: string) => {
    if (key === 'manual') handleManual();
    else if (key === 'text') handleText();
    else if (key === 'voice') handleVoice();
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
        {Platform.OS === 'ios' ? (
          <BlurView intensity={60} tint="dark" style={{ flex: 1 }}>
            <Pressable style={{ flex: 1 }} onPress={handleMenuClose} />
            <MenuItems onItemPress={handleItemPress} onClose={handleMenuClose} />
          </BlurView>
        ) : (
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.75)' }}>
            <Pressable style={{ flex: 1 }} onPress={handleMenuClose} />
            <MenuItems onItemPress={handleItemPress} onClose={handleMenuClose} />
          </View>
        )}
      </Modal>

      <BottomSheet ref={manualRef} snapPoints={['100%']}>
        <CreateTransactionForm onSuccess={handleManualSuccess} />
      </BottomSheet>

      <BottomSheet ref={textRef} enableDynamicSizing snapPoints={[]} keyboardBehavior="interactive" keyboardBlurBehavior="restore" android_keyboardInputMode="adjustResize">
        <CreateTransactionText onSuccess={handleTextSuccess} />
      </BottomSheet>

      <BottomSheet ref={voiceRef} enableDynamicSizing snapPoints={[]}>        
        <CreateTransactionVoice onSuccess={handleVoiceSuccess} />
      </BottomSheet>
    </>
  );
}
