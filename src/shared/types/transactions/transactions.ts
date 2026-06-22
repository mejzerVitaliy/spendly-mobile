import { TransactionType } from "@/shared/constants";
import { ApiResponse } from "../api";
import { CategoryDto } from "../category";

// ─── AI Preview ───────────────────────────────────────────────────────────────

interface ParsedTransactionPreview {
  transactionType: 'INCOME' | 'EXPENSE' | 'TRANSFER'
  amount: number
  currencyCode: string
  categoryId?: string | null
  walletId?: string | null
  toWalletId?: string | null
  description: string
  date: string
}

interface PreviewTransactionRequest {
  text: string
}

interface PreviewTransactionResponse extends ApiResponse<{
  transactions: ParsedTransactionPreview[]
}> {}

export type RecurringPeriod = 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'SEMIANNUAL' | 'ANNUAL'

export const RECURRING_PERIODS: RecurringPeriod[] = ['DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'SEMIANNUAL', 'ANNUAL']

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
  pairedTransactionWalletId?: string | null
  pairedTransactionCurrencyCode?: string | null
  pairedTransactionAmount?: number | null
  isRecurring?: boolean
  recurringPeriod?: RecurringPeriod | null
  nextRecurringDate?: string | null
}

interface UpdateTransferRequest {
  fromWalletId?: string
  toWalletId?: string
  fromAmount: number
  date: string
  description?: string
}

interface UpdateTransferResponse extends ApiResponse<{
  fromTransaction: Transaction
  toTransaction: Transaction
}> {}

interface CreateTransactionRequest {
  description?: string
  amount: number
  type: TransactionType
  date: string
  categoryId: string
  currencyCode: string
  walletId?: string
  isRecurring?: boolean
  recurringPeriod?: RecurringPeriod | null
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
  isRecurring?: boolean
  recurringPeriod?: RecurringPeriod | null
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

interface GetRecurringDueResponse extends ApiResponse<Transaction[]> {}
interface ProcessRecurringResponse extends ApiResponse<{ created: Transaction; nextRecurringDate: string }> {}

export type {
    ParsedTransactionPreview,
    PreviewTransactionRequest,
    PreviewTransactionResponse,
    CreateTransactionRequest,
    CreateTransferRequest,
    CreateTransferResponse,
    UpdateTransferRequest,
    UpdateTransferResponse,
    CreateTransactionResponse,
    GetAllTransactionsResponse,
    GetTransactionByIdResponse,
    ParseTextTransactionRequest,
    ParseTextTransactionResponse,
    ParseVoiceTransactionResponse,
    Transaction,
    UpdateTransactionRequest,
    UpdateTransactionResponse,
    GetRecurringDueResponse,
    ProcessRecurringResponse,
};
