import { Category, TransactionType } from "@/shared/constants";
import { ApiResponse } from "../api";

interface Transaction {
  id: string
  description?: string
  amount: number
  type: TransactionType
  date: string
  category: Category
  currencyCode: string
  convertedAmount: number
  mainCurrencyCode: string
}

interface CreateTransactionRequest {
  description?: string
  amount: number
  type: TransactionType
  date: string
  category: Category
  currencyCode: string
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
  currencyCode: string
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

