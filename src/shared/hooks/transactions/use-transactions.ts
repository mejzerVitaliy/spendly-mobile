import { transactionsApi } from "@/shared/services/api";
import { CreateTransactionRequest, CreateTransferRequest, ParsedTransactionPreview, UpdateTransactionRequest, UpdateTransferRequest } from "@/shared/types";
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

  const createTransferMutation = useMutation({
    mutationKey: ['transactions', 'createTransfer'],
    mutationFn: (request: CreateTransferRequest) => transactionsApi.createTransfer(request),
    onSuccess: async () => {
      await invalidateAll(queryClient)
    },
  })

  const updateTransferMutation = useMutation({
    mutationKey: ['transactions', 'updateTransfer'],
    mutationFn: ({ transferGroupId, request }: { transferGroupId: string; request: UpdateTransferRequest }) =>
      transactionsApi.updateTransfer(transferGroupId, request),
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

  const previewTextMutation = useMutation({
    mutationKey: ['transactions', 'previewText'],
    mutationFn: (text: string) => transactionsApi.previewText(text),
  })

  const previewVoiceMutation = useMutation({
    mutationKey: ['transactions', 'previewVoice'],
    mutationFn: (audioUri: string) => transactionsApi.previewVoice(audioUri),
  })

  const createFromPreviewMutation = useMutation({
    mutationKey: ['transactions', 'createFromPreview'],
    mutationFn: async (previews: ParsedTransactionPreview[]) => {
      const results = []
      for (const tx of previews) {
        if (tx.transactionType === 'TRANSFER') {
          if (!tx.walletId || !tx.toWalletId) continue
          const res = await transactionsApi.createTransfer({
            fromWalletId: tx.walletId,
            toWalletId: tx.toWalletId,
            fromAmount: tx.amount,
            date: tx.date,
            description: tx.description || undefined,
          })
          results.push(res)
        } else {
          const res = await transactionsApi.create({
            amount: tx.amount,
            date: tx.date,
            currencyCode: tx.currencyCode,
            type: tx.transactionType as unknown as import('@/shared/constants').TransactionType,
            categoryId: tx.categoryId ?? '',
            description: tx.description || undefined,
            walletId: tx.walletId ?? undefined,
          })
          results.push(res)
        }
      }
      return results
    },
    onSuccess: async () => {
      await invalidateAll(queryClient)
    },
  })

  return {
    createMutation,
    createTransferMutation,
    updateTransferMutation,
    updateMutation,
    removeMutation,
    parseTextMutation,
    parseVoiceMutation,
    previewTextMutation,
    previewVoiceMutation,
    createFromPreviewMutation,
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