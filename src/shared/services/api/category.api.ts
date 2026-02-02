import {
  GetAllCategoriesResponse,
  GetUserFavoriteCategoriesResponse,
  UpdateUserFavoriteCategoriesRequest,
  UpdateUserFavoriteCategoriesResponse,
} from '@/shared/types';
import { apiClient } from './api';

const getAll = async (): Promise<GetAllCategoriesResponse> => {
  const { data } = await apiClient.get<GetAllCategoriesResponse>('/category');
  return data;
};

const getFavorites = async (): Promise<GetUserFavoriteCategoriesResponse> => {
  const { data } = await apiClient.get<GetUserFavoriteCategoriesResponse>(
    '/category/favorites',
  );
  return data;
};

const updateFavorites = async (
  request: UpdateUserFavoriteCategoriesRequest,
): Promise<UpdateUserFavoriteCategoriesResponse> => {
  const { data } = await apiClient.put<UpdateUserFavoriteCategoriesResponse>(
    '/category/favorites',
    request,
  );
  return data;
};

export const categoryApi = {
  getAll,
  getFavorites,
  updateFavorites,
};
