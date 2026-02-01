import { transactionsApi } from "@/shared/services/api";
import { CreateTransactionRequest, UpdateTransactionRequest } from "@/shared/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const useTransactions = () => {
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationKey: ['transactions', 'create'],
    mutationFn: (request: CreateTransactionRequest) => transactionsApi.create(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['reports'] })
      queryClient.invalidateQueries({ queryKey: ['user'] })
      queryClient.invalidateQueries({ queryKey: ['wallets'] })
    },
  })

  const getAllQuery = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      console.log('🔄 Fetching transactions...');
      try {
        const result = await transactionsApi.getAll();
        console.log('✅ Transactions fetched:', result.data?.length || 0);
        return result;
      } catch (error) {
        console.error('❌ Failed to fetch transactions:', error);
        throw error;
      }
    },
    retry: 1,
  })

  const useGetByIdQuery = (id: string) => useQuery({
    queryKey: ['transactions', id],
    queryFn: () => transactionsApi.getById(id),
    enabled: !!id,
  })

  const updateMutation = useMutation({
    mutationKey: ['transactions', 'update'],
    mutationFn: ({ id, request }: { id: string; request: UpdateTransactionRequest }) =>
      transactionsApi.update(id, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['reports'] })
      queryClient.invalidateQueries({ queryKey: ['user'] })
      queryClient.invalidateQueries({ queryKey: ['wallets'] })
    },
  })

  const removeMutation = useMutation({
    mutationKey: ['transactions', 'remove'],
    mutationFn: ({ id }: { id: string }) => transactionsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['user'] })
      queryClient.invalidateQueries({ queryKey: ['wallets'] })
    },
  })

  return {
    createMutation,
    getAllQuery,
    getByIdQuery: useGetByIdQuery,
    updateMutation,
    removeMutation,
  }
}

export { useTransactions };