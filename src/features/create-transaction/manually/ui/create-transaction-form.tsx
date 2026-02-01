import { TransactionForm } from '@/shared/ui';

interface CreateTransactionFormProps {
  onSuccess?: () => void;
}

const CreateTransactionForm = ({ onSuccess }: CreateTransactionFormProps) => {
  return <TransactionForm mode="create" onSuccess={onSuccess} />;
};

export { CreateTransactionForm };
