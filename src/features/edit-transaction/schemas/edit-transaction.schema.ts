import { Category, Currency, TransactionType } from '@/shared/constants';
import { z } from 'zod';

export const editTransactionSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  date: z.string(),
  currency: z.nativeEnum(Currency),
  type: z.nativeEnum(TransactionType),
  category: z.nativeEnum(Category),
  description: z.string().optional(),
});

export type EditTransactionFormData = z.infer<typeof editTransactionSchema>;
