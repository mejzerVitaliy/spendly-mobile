import { BottomSheet, type BottomSheetRef } from '@/shared/ui';
import { Text, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CreateTransactionForm } from './ui';
import { CreateTransactionText } from '../typing/create-transaction-text';
import { useRef, useState } from 'react';

const CreateTransaction = () => {
  const menuRef = useRef<BottomSheetRef>(null);
  const manualRef = useRef<BottomSheetRef>(null);
  const textRef = useRef<BottomSheetRef>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleManual = () => {
    menuRef.current?.close();
    setTimeout(() => manualRef.current?.open(), 200);
  };

  const handleText = () => {
    menuRef.current?.close();
    setTimeout(() => textRef.current?.open(), 200);
  };

  const handleManualSuccess = () => {
    manualRef.current?.close();
  };

  const handleTextSuccess = () => {
    textRef.current?.close();
  };

  return (
    <>
      <BottomSheet
        ref={menuRef}
        enableDynamicSizing
        snapPoints={['100%']}
        onOpenChange={setMenuOpen}
        trigger={({ toggle }) => (
          <Pressable
            onPress={() => toggle()}
            className="w-[60px] h-[60px] bg-primary active:opacity-90 rounded-full absolute bottom-5 right-5 items-center justify-center shadow-lg"
          >
            <Ionicons
              name={menuOpen ? 'close' : 'add'}
              size={32}
              color="#ffffff"
            />
          </Pressable>
        )}
      >
        <View className="px-5 pb-8 pt-2">
          <Text className="text-lg font-bold text-foreground mb-4">
            New Transaction
          </Text>

          <Pressable
            className="flex-row items-center py-3 active:opacity-70"
            onPress={handleManual}
          >
            <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center mr-3">
              <Ionicons name="create-outline" size={20} color="#6366F1" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-medium text-foreground">
                Manual Entry
              </Text>
              <Text className="text-sm text-muted-foreground">
                Fill in transaction details yourself
              </Text>
            </View>
          </Pressable>

          <Pressable
            className="flex-row items-center py-3 active:opacity-70"
            onPress={handleText}
          >
            <View className="w-10 h-10 rounded-full bg-emerald-500/10 items-center justify-center mr-3">
              <Ionicons name="sparkles" size={20} color="#10B981" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-medium text-foreground">
                Text Input (AI)
              </Text>
              <Text className="text-sm text-muted-foreground">
                Describe and AI will create it
              </Text>
            </View>
          </Pressable>

          <Pressable
            className="flex-row items-center py-3 opacity-40"
            disabled
          >
            <View className="w-10 h-10 rounded-full bg-orange-500/10 items-center justify-center mr-3">
              <Ionicons name="mic-outline" size={20} color="#F97316" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-medium text-foreground">
                Voice Input
              </Text>
              <Text className="text-sm text-muted-foreground">
                Coming soon
              </Text>
            </View>
          </Pressable>
        </View>
      </BottomSheet>

      <BottomSheet ref={manualRef}>
        <CreateTransactionForm onSuccess={handleManualSuccess} />
      </BottomSheet>

      <BottomSheet
        ref={textRef}
        snapPoints={['60%']}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
      >
        <CreateTransactionText onSuccess={handleTextSuccess} />
      </BottomSheet>
    </>
  );
};

export { CreateTransaction };
