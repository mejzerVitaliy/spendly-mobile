import { ApiResponse } from '../api';

export type WalletType = 'CASH' | 'DEBIT_CARD' | 'CREDIT_CARD' | 'SAVINGS' | 'CUSTOM';

export interface WalletDto {
  id: string;
  userId: string;
  name: string;
  type: WalletType;
  currencyCode: string;
  initialBalance: number;
  currentBalance: number;
  convertedBalance?: number;
  mainCurrencyCode?: string;
  isDefault: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWalletRequest {
  name: string;
  currencyCode: string;
  type?: WalletType;
  initialBalance?: number;
}

export interface UpdateWalletRequest {
  name?: string;
  type?: WalletType;
}

export interface SetDefaultWalletRequest {
  walletId: string;
}

export interface TotalBalanceDto {
  totalBalance: number;
  walletsCount: number;
}

export interface GetAllWalletsResponse extends ApiResponse<WalletDto[]> {}
export interface GetWalletByIdResponse extends ApiResponse<WalletDto> {}
export interface CreateWalletResponse extends ApiResponse<WalletDto> {}
export interface UpdateWalletResponse extends ApiResponse<WalletDto> {}
export interface GetTotalBalanceResponse extends ApiResponse<TotalBalanceDto> {}
