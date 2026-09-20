import { transactionsApi } from "@/shared/services/api";
import { notificationService } from "@/shared/services/notifications";
import { reviewPromptService } from "@/shared/services/review-prompt";
import { CreateTransactionRequest, CreateTransferRequest, ParsedTransactionPreview, UpdateTransactionRequest, UpdateTransferRequest } from "@/shared/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface GetAllTransactionsParams {
  startDate?: string;
  endDate?: string;
  search?: string;
  walletId?: string;
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

const invalidateUsage = (queryClient: ReturnType<typeof useQueryClient>) =>
  queryClient.invalidateQueries({ queryKey: ['usage'], exact: false, refetchType: 'all' })

// Shared by every path that successfully adds a transaction to the user's
// data (manual, transfer, AI text/voice via createFromPreviewMutation below)
// - streak tracking and the native review-prompt check both belong on every
// one of those, not just the manual-entry form they originally shipped with.
const onTransactionSuccess = () => {
  notificationService.onTransactionCreated()
  reviewPromptService.maybePromptForReview()
}

const useTransactions = () => {
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationKey: ['transactions', 'create'],
    mutationFn: (request: CreateTransactionRequest) => transactionsApi.create(request),
    onSuccess: async () => {
      await invalidateAll(queryClient)
      onTransactionSuccess()
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
      onTransactionSuccess()
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
      await Promise.all([invalidateAll(queryClient), invalidateUsage(queryClient)])
      onTransactionSuccess()
    },
  })

  const parseVoiceMutation = useMutation({
    mutationKey: ['transactions', 'parseVoice'],
    mutationFn: (audioUri: string) => transactionsApi.parseVoice(audioUri),
    onSuccess: async () => {
      await Promise.all([invalidateAll(queryClient), invalidateUsage(queryClient)])
      onTransactionSuccess()
    },
  })

  const previewTextMutation = useMutation({
    mutationKey: ['transactions', 'previewText'],
    mutationFn: (text: string) => transactionsApi.previewText(text),
    onSuccess: () => { invalidateUsage(queryClient); },
  })

  const previewVoiceMutation = useMutation({
    mutationKey: ['transactions', 'previewVoice'],
    mutationFn: (audioUri: string) => transactionsApi.previewVoice(audioUri),
    onSuccess: () => { invalidateUsage(queryClient); },
  })

  const createFromPreviewMutation = useMutation({
    mutationKey: ['transactions', 'createFromPreview'],
    mutationFn: async ({ previews, isRecurring, recurringPeriod }: {
      previews: ParsedTransactionPreview[]
      isRecurring?: boolean
      recurringPeriod?: import('@/shared/types/transactions/transactions').RecurringPeriod | null
    }) => {
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
            isRecurring: isRecurring ?? false,
            recurringPeriod: isRecurring ? recurringPeriod : null,
          })
          results.push(res)
        }
      }
      return results
    },
    onSuccess: async () => {
      await invalidateAll(queryClient)
      // This is the actual creation step for both AI text and AI voice
      // entry (they preview first, then confirm through here) - it was
      // missing this call entirely, so streak tracking and the review
      // prompt silently never fired for either AI path.
      onTransactionSuccess()
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