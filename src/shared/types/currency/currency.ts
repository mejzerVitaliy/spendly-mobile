import { ApiResponse } from '../api';

export interface CurrencyDto {
  code: string;
  name: string;
}

export interface UserFavoriteCurrencyDto {
  id: string;
  userId: string;
  currencyCode: string;
  order: number;
  createdAt: string;
  currency: CurrencyDto;
}

export interface UpdateUserFavoriteCurrenciesRequest {
  currencyCodes: string[];
}

export interface GetAllCurrenciesResponse extends ApiResponse<CurrencyDto[]> {}

export interface GetUserFavoriteCurrenciesResponse
  extends ApiResponse<UserFavoriteCurrencyDto[]> {}

export interface UpdateUserFavoriteCurrenciesResponse
  extends ApiResponse<UserFavoriteCurrencyDto[]> {}
