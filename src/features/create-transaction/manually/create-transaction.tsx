import { BottomSheet, type BottomSheetRef } from '@/shared/ui';
import { Text, Pressable } from 'react-native';
import { CreateTransactionForm } from './ui';
import { useRef } from 'react';

const CreateTransaction = () => {
  const bottomSheetRef = useRef<BottomSheetRef>(null);

  const handleSuccess = () => {
    bottomSheetRef.current?.close();
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      snapPoints={['100%']}
      trigger={({ toggle }) => (
        <Pressable
          onPress={(_e) => toggle()}
          className="w-[60px] h-[60px] bg-primary active:bg-primary-hover active:scale-95 transition-all rounded-full absolute bottom-5 right-5 items-center justify-center shadow-lg"
        >
          <Text className="text-white text-4xl font-medium">+</Text>
        </Pressable>
      )}
    >
      <CreateTransactionForm onSuccess={handleSuccess} />
    </BottomSheet>
  );
};

export { CreateTransaction };
