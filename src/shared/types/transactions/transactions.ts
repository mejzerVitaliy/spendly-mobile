import { Category, Currency, TransactionType } from "@/shared/constants";
import { ApiResponse } from "../api";

interface Transaction {
  id: string
  description?: string
  amount: number
  type: TransactionType
  date: string
  category: Category
  currency: Currency
}

interface CreateTransactionRequest {
  description?: string
  amount: number
  type: TransactionType
  date: string
  category: Category
  currency: Currency
}

interface CreateTransactionResponse
  extends ApiResponse<Transaction> {}

interface GetAllTransactionsResponse
  extends ApiResponse<Transaction[]> {}

interface GetTransactionByIdResponse
  extends ApiResponse<Transaction> {}

interface UpdateTransactionRequest {
  description?: string
  amount: number
  type: TransactionType
  date: string
  category: Category
  currency: Currency
}

interface UpdateTransactionResponse
  extends ApiResponse<Transaction> {}


export type {
  Transaction,
  CreateTransactionRequest,
  CreateTransactionResponse,
  GetAllTransactionsResponse,
  GetTransactionByIdResponse,
  UpdateTransactionRequest,
  UpdateTransactionResponse
}
