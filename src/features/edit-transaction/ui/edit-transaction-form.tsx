import { TransactionForm } from '@/shared/ui';

interface EditTransactionFormProps {
  transactionId: string;
  onSuccess?: () => void;
}

const EditTransactionForm = ({ transactionId, onSuccess }: EditTransactionFormProps) => {
  return <TransactionForm mode="edit" transactionId={transactionId} onSuccess={onSuccess} />;
};

export { EditTransactionForm };
