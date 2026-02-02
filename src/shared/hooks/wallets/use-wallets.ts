import { walletApi } from '@/shared/services/api';
import { CreateWalletRequest, SetDefaultWalletRequest, UpdateWalletRequest } from '@/shared/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const useWallets = (includeArchived = false) => {
  const queryClient = useQueryClient();

  const getAllQuery = useQuery({
    queryKey: ['wallets', includeArchived],
    queryFn: () => walletApi.getAll(includeArchived),
  });

  const getDefaultQuery = useQuery({
    queryKey: ['wallets', 'default'],
    queryFn: () => walletApi.getDefault(),
  });

  const getTotalBalanceQuery = useQuery({
    queryKey: ['wallets', 'totalBalance'],
    queryFn: () => walletApi.getTotalBalance(),
  });

  const createMutation = useMutation({
    mutationKey: ['wallets', 'create'],
    mutationFn: (request: CreateWalletRequest) => walletApi.create(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
    },
  });

  const updateMutation = useMutation({
    mutationKey: ['wallets', 'update'],
    mutationFn: ({ id, request }: { id: string; request: UpdateWalletRequest }) =>
      walletApi.update(id, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
    },
  });

  const archiveMutation = useMutation({
    mutationKey: ['wallets', 'archive'],
    mutationFn: (id: string) => walletApi.archive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
    },
  });

  const unarchiveMutation = useMutation({
    mutationKey: ['wallets', 'unarchive'],
    mutationFn: (id: string) => walletApi.unarchive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
    },
  });

  const setDefaultMutation = useMutation({
    mutationKey: ['wallets', 'setDefault'],
    mutationFn: (request: SetDefaultWalletRequest) => walletApi.setDefault(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
    },
  });

  return {
    wallets: getAllQuery.data?.data || [],
    defaultWallet: getDefaultQuery.data?.data,
    totalBalance: getTotalBalanceQuery.data?.data,
    isLoading: getAllQuery.isLoading || getDefaultQuery.isLoading || getTotalBalanceQuery.isLoading,
    isError: getAllQuery.isError || getDefaultQuery.isError || getTotalBalanceQuery.isError,
    createMutation,
    updateMutation,
    archiveMutation,
    unarchiveMutation,
    setDefaultMutation,
    refetch: () => {
      getAllQuery.refetch();
      getDefaultQuery.refetch();
      getTotalBalanceQuery.refetch();
    },
  };
};

export { useWallets };
