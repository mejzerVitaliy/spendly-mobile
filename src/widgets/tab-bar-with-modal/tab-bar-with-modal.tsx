import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { TabBar } from '@/shared/ui/tab-bar';
import { BottomSheet, type BottomSheetRef } from '@/shared/ui';
import { CreateTransactionForm } from '@/features/create-transaction/manually/ui';
import { useRef } from 'react';

export function TabBarWithModal(props: BottomTabBarProps) {
  const bottomSheetRef = useRef<BottomSheetRef>(null);

  const handleCreateTransaction = () => {
    bottomSheetRef.current?.open();
  };

  const handleSuccess = () => {
    bottomSheetRef.current?.close();
  };

  return (
    <>
      <TabBar {...props} onCreateTransaction={handleCreateTransaction} />
      <BottomSheet ref={bottomSheetRef} snapPoints={['100%']}>
        <CreateTransactionForm onSuccess={handleSuccess} />
      </BottomSheet>
    </>
  );
}
