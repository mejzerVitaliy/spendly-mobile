import { Transaction } from '@/shared/types';
import { BottomSheet, BottomSheetRef } from '@/shared/ui';
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { EditTransactionForm } from './ui/edit-transaction-form';

export interface EditTransactionRef {
  open: (transaction: Transaction) => void;
  close: () => void;
}

const EditTransaction = forwardRef<EditTransactionRef>((_, ref) => {
  const bottomSheetRef = useRef<BottomSheetRef>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  useImperativeHandle(ref, () => ({
    open: (transaction: Transaction) => {
      setSelectedTransaction(transaction);
      bottomSheetRef.current?.open();
    },
    close: () => {
      bottomSheetRef.current?.close();
      setSelectedTransaction(null);
    },
  }));

  const handleSuccess = () => {
    bottomSheetRef.current?.close();
    setSelectedTransaction(null);
  };

  return (
    <BottomSheet ref={bottomSheetRef}>
      {selectedTransaction && (
        <EditTransactionForm
          transaction={selectedTransaction}
          onSuccess={handleSuccess}
        />
      )}
    </BottomSheet>
  );
});

EditTransaction.displayName = 'EditTransaction';

export { EditTransaction };
