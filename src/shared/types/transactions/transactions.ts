import { TransactionType } from "@/shared/constants";
import { ApiResponse } from "../api";
import { CategoryDto } from "../category";

interface Transaction {
  id: string
  description?: string
  amount: number
  type: TransactionType
  date: string
  categoryId: string
  category?: CategoryDto
  currencyCode: string
  walletId: string
  convertedAmount: number
  mainCurrencyCode: string
}

interface CreateTransactionRequest {
  description?: string
  amount: number
  type: TransactionType
  date: string
  categoryId: string
  currencyCode: string
  walletId?: string
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
  categoryId: string
  currencyCode: string
  walletId?: string
}

interface UpdateTransactionResponse
  extends ApiResponse<Transaction> {}


export type {
    CreateTransactionRequest,
    CreateTransactionResponse,
    GetAllTransactionsResponse,
    GetTransactionByIdResponse, Transaction, UpdateTransactionRequest,
    UpdateTransactionResponse
};

