import { TransactionType } from "@/shared/constants";
import { ApiResponse } from "../api";
import { CategoryDto } from "../category";

interface Transaction {
  id: string
  description?: string
  amount: number
  type: TransactionType
  date: string
  categoryId?: string | null
  category?: CategoryDto
  currencyCode: string
  walletId: string
  convertedAmount: number
  mainCurrencyCode: string
  transferGroupId?: string | null
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

interface CreateTransferRequest {
  fromWalletId: string
  toWalletId: string
  fromAmount: number
  date: string
  description?: string
}

interface CreateTransferResponse extends ApiResponse<{
  fromTransaction: Transaction
  toTransaction: Transaction
  exchangeRate: number
  fromCurrencyCode: string
  toCurrencyCode: string
  fromAmount: number
  toAmount: number
}> {}

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


interface ParseTextTransactionRequest {
  text: string
}

interface ParseTextTransactionResponse
  extends ApiResponse<Transaction[]> {}

interface ParseVoiceTransactionResponse
  extends ApiResponse<Transaction[]> {}

export type {
    CreateTransactionRequest,
    CreateTransferRequest,
    CreateTransferResponse,
    CreateTransactionResponse,
    GetAllTransactionsResponse,
    GetTransactionByIdResponse,
    ParseTextTransactionRequest,
    ParseTextTransactionResponse,
    ParseVoiceTransactionResponse,
    Transaction,
    UpdateTransactionRequest,
    UpdateTransactionResponse
};
