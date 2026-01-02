import { Category, Currency, TransactionType } from "@/shared/constants";
import { z } from "zod";

const createTransactionSchema = z.object({
  amount: z.coerce.number().positive('Сумма должна быть положительной'),
  date: z.string().datetime(),
  currency: z.nativeEnum(Currency),
  description: z.string().optional(),
  category: z.nativeEnum(Category),
  type: z.nativeEnum(TransactionType)
});

export type CreateTransactionFormData = z.infer<typeof createTransactionSchema>;

export {
    createTransactionSchema,
}