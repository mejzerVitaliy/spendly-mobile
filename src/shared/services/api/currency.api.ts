import {
    GetAllCurrenciesResponse,
    GetUserFavoriteCurrenciesResponse,
    UpdateUserFavoriteCurrenciesRequest,
    UpdateUserFavoriteCurrenciesResponse,
} from '@/shared/types';
import { apiClient } from './api';

const getAll = async (): Promise<GetAllCurrenciesResponse> => {
  const { data } = await apiClient.get<GetAllCurrenciesResponse>('/currency');
  return data;
};

const getFavorites = async (): Promise<GetUserFavoriteCurrenciesResponse> => {
  const { data } = await apiClient.get<GetUserFavoriteCurrenciesResponse>(
    '/currency/favorites',
  );
  return data;
};

const updateFavorites = async (
  request: UpdateUserFavoriteCurrenciesRequest,
): Promise<UpdateUserFavoriteCurrenciesResponse> => {
  const { data } = await apiClient.put<UpdateUserFavoriteCurrenciesResponse>(
    '/currency/favorites',
    request,
  );
  return data;
};

export const currencyApi = {
  getAll,
  getFavorites,
  updateFavorites,
};
