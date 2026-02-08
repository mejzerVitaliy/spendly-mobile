import { transactionsApi } from "@/shared/services/api";
import { CreateTransactionRequest, UpdateTransactionRequest } from "@/shared/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface GetAllTransactionsParams {
  startDate?: string;
  endDate?: string;
  search?: string;
}

const useTransactions = () => {
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationKey: ['transactions', 'create'],
    mutationFn: (request: CreateTransactionRequest) => transactionsApi.create(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'], exact: false })
      queryClient.invalidateQueries({ queryKey: ['reports'], exact: false })
      queryClient.invalidateQueries({ queryKey: ['user'] })
      queryClient.invalidateQueries({ queryKey: ['wallets'] })
    },
  })

  const updateMutation = useMutation({
    mutationKey: ['transactions', 'update'],
    mutationFn: ({ id, request }: { id: string; request: UpdateTransactionRequest }) =>
      transactionsApi.update(id, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'], exact: false })
      queryClient.invalidateQueries({ queryKey: ['reports'], exact: false })
      queryClient.invalidateQueries({ queryKey: ['user'] })
      queryClient.invalidateQueries({ queryKey: ['wallets'] })
    },
  })

  const removeMutation = useMutation({
    mutationKey: ['transactions', 'remove'],
    mutationFn: ({ id }: { id: string }) => transactionsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'], exact: false })
      queryClient.invalidateQueries({ queryKey: ['reports'], exact: false })
      queryClient.invalidateQueries({ queryKey: ['user'] })
      queryClient.invalidateQueries({ queryKey: ['wallets'] })
    },
  })

  return {
    createMutation,
    updateMutation,
    removeMutation,
  }
}

export const useGetAllTransactions = (params?: GetAllTransactionsParams) => {
  return useQuery({
    queryKey: ['transactions', params],
    queryFn: async () => {
      console.log('🔄 Fetching transactions...', params);
      try {
        const result = await transactionsApi.getAll(params);
        console.log('✅ Transactions fetched:', result.data?.length || 0);
        return result;
      } catch (error) {
        console.error('❌ Failed to fetch transactions:', error);
        throw error;
      }
    },
    retry: 1,
  })
}

export const useGetTransactionById = (id: string) => {
  return useQuery({
    queryKey: ['transactions', id],
    queryFn: () => transactionsApi.getById(id),
    enabled: !!id,
  })
}

export { useTransactions };