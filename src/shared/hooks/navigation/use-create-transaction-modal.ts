import { useRef } from 'react';
import type { BottomSheetRef } from '@/shared/ui';

export function useCreateTransactionModal() {
  const bottomSheetRef = useRef<BottomSheetRef>(null);

  const openModal = () => {
    bottomSheetRef.current?.open();
  };

  const closeModal = () => {
    bottomSheetRef.current?.close();
  };

  return {
    bottomSheetRef,
    open: openModal,
    close: closeModal,
  };
}
