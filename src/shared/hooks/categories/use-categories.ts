import { categoryApi } from '@/shared/services/api/category.api';
import { UpdateUserFavoriteCategoriesRequest } from '@/shared/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const useCategories = () => {
  const queryClient = useQueryClient();

  const getAllQuery = useQuery({
    queryKey: ['categories', 'all'],
    queryFn: () => categoryApi.getAll(),
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
  });

  const getFavoritesQuery = useQuery({
    queryKey: ['categories', 'favorites'],
    queryFn: () => categoryApi.getFavorites(),
    staleTime: 5 * 60 * 1000,
  });

  const updateFavoritesMutation = useMutation({
    mutationKey: ['categories', 'favorites', 'update'],
    mutationFn: (request: UpdateUserFavoriteCategoriesRequest) =>
      categoryApi.updateFavorites(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', 'favorites'] });
    },
  });

  return {
    getAllQuery,
    getFavoritesQuery,
    updateFavoritesMutation,
  };
};

export { useCategories };
