import { ApiResponse } from '../api';

export type CategoryType = 'INCOME' | 'EXPENSE';

export interface CategoryDto {
  id: string;
  name: string;
  color: string;
  type: CategoryType;
  order: number;
}

export interface UserFavoriteCategoryDto {
  id: string;
  userId: string;
  categoryId: string;
  order: number;
  createdAt: string;
  category: CategoryDto;
}

export interface UpdateUserFavoriteCategoriesRequest {
  categoryIds: string[];
}

export interface GetAllCategoriesResponse extends ApiResponse<CategoryDto[]> {}

export interface GetUserFavoriteCategoriesResponse
  extends ApiResponse<UserFavoriteCategoryDto[]> {}

export interface UpdateUserFavoriteCategoriesResponse
  extends ApiResponse<UserFavoriteCategoryDto[]> {}
