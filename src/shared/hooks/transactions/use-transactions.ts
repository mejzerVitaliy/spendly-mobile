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
      queryClient.invalidateQueries({ queryKey: ['user'] })
    },
  })

  const getAllQuery = useQuery({
    queryKey: ['transactions'],
    queryFn: () => transactionsApi.getAll(),
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
      queryClient.invalidateQueries({ queryKey: ['user'] })
    },
  })

  const removeMutation = useMutation({
    mutationKey: ['transactions', 'remove'],
    mutationFn: ({ id }: { id: string }) => transactionsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['user'] })
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