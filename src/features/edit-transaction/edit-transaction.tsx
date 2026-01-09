import { BottomSheet, BottomSheetRef } from '@/shared/ui';
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { EditTransactionForm } from './ui/edit-transaction-form';

export interface EditTransactionRef {
  open: (transactionId: string) => void;
  close: () => void;
}

const EditTransaction = forwardRef<EditTransactionRef>((_, ref) => {
  const bottomSheetRef = useRef<BottomSheetRef>(null);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);

  useImperativeHandle(ref, () => ({
    open: (transactionId: string) => {
      setSelectedTransactionId(transactionId);
      bottomSheetRef.current?.open();
    },
    close: () => {
      bottomSheetRef.current?.close();
      setSelectedTransactionId(null);
    },
  }));

  const handleSuccess = () => {
    bottomSheetRef.current?.close();
    setSelectedTransactionId(null);
  };

  return (
    <BottomSheet ref={bottomSheetRef}>
      {selectedTransactionId && (
        <EditTransactionForm
          transactionId={selectedTransactionId}
          onSuccess={handleSuccess}
        />
      )}
    </BottomSheet>
  );
});

EditTransaction.displayName = 'EditTransaction';

export { EditTransaction };
