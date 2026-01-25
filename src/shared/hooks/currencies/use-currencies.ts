import { currencyApi } from '@/shared/services/api/currency.api';
import { UpdateUserFavoriteCurrenciesRequest } from '@/shared/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const useCurrencies = () => {
  const queryClient = useQueryClient();

  const getAllQuery = useQuery({
    queryKey: ['currencies', 'all'],
    queryFn: () => currencyApi.getAll(),
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
  });

  const getFavoritesQuery = useQuery({
    queryKey: ['currencies', 'favorites'],
    queryFn: () => currencyApi.getFavorites(),
    staleTime: 5 * 60 * 1000,
  });

  const updateFavoritesMutation = useMutation({
    mutationKey: ['currencies', 'favorites', 'update'],
    mutationFn: (request: UpdateUserFavoriteCurrenciesRequest) =>
      currencyApi.updateFavorites(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currencies', 'favorites'] });
    },
  });

  return {
    getAllQuery,
    getFavoritesQuery,
    updateFavoritesMutation,
  };
};

export { useCurrencies };
