import { transactionsApi } from "@/shared/services/api";
import { CreateTransactionRequest, UpdateTransactionRequest } from "@/shared/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface GetAllTransactionsParams {
  startDate?: string;
  endDate?: string;
  search?: string;
}

const invalidateAll = (queryClient: ReturnType<typeof useQueryClient>) => {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: ['transactions'], exact: false, refetchType: 'all' }),
    queryClient.invalidateQueries({ queryKey: ['reports'], exact: false, refetchType: 'all' }),
    queryClient.invalidateQueries({ queryKey: ['wallets'], exact: false, refetchType: 'all' }),
  ]).then(() =>
    Promise.all([
      queryClient.refetchQueries({ queryKey: ['transactions'], exact: false, type: 'active' }),
      queryClient.refetchQueries({ queryKey: ['reports'], exact: false, type: 'active' }),
      queryClient.refetchQueries({ queryKey: ['wallets'], exact: false, type: 'active' }),
    ])
  )
}

const useTransactions = () => {
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationKey: ['transactions', 'create'],
    mutationFn: (request: CreateTransactionRequest) => transactionsApi.create(request),
    onSuccess: async () => {
      await invalidateAll(queryClient)
    },
  })

  const updateMutation = useMutation({
    mutationKey: ['transactions', 'update'],
    mutationFn: ({ id, request }: { id: string; request: UpdateTransactionRequest }) =>
      transactionsApi.update(id, request),
    onSuccess: async () => {
      await invalidateAll(queryClient)
    },
  })

  const removeMutation = useMutation({
    mutationKey: ['transactions', 'remove'],
    mutationFn: ({ id }: { id: string }) => transactionsApi.remove(id),
    onSuccess: async () => {
      await invalidateAll(queryClient)
    },
  })

  const parseTextMutation = useMutation({
    mutationKey: ['transactions', 'parseText'],
    mutationFn: (text: string) => transactionsApi.parseText({ text }),
    onSuccess: async () => {
      await invalidateAll(queryClient)
    },
  })

  const parseVoiceMutation = useMutation({
    mutationKey: ['transactions', 'parseVoice'],
    mutationFn: (audioUri: string) => transactionsApi.parseVoice(audioUri),
    onSuccess: async () => {
      await invalidateAll(queryClient)
    },
  })

  return {
    createMutation,
    updateMutation,
    removeMutation,
    parseTextMutation,
    parseVoiceMutation,
  }
}

export const useGetAllTransactions = (params?: GetAllTransactionsParams) => {
  return useQuery({
    queryKey: ['transactions', params],
    queryFn: async () => {
      try {
        const result = await transactionsApi.getAll(params);
        return result;
      } catch (error) {
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