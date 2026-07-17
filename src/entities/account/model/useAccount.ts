import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult
} from '@tanstack/react-query';

import { useAppStore } from '@/app/store';

import { removeAccount, setActiveAccount } from '../api';

import { accountListQueryKey, fetchAccountList } from './accountQueries';
import type { Account } from './types';

export const useAccountList = (): UseQueryResult<Account[]> =>
  useQuery({
    queryKey: accountListQueryKey(),
    queryFn: ({ signal }) => fetchAccountList(signal)
  });

export const useAccount = (id: string | null): Account | null => {
  const query = useAccountList();
  if (!id) return null;
  return query.data?.find((account) => account.id === id) ?? null;
};

export const useSetActiveAccount = (): UseMutationResult<void, Error, string> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => setActiveAccount(id),
    onSuccess: (_data, id) => {
      useAppStore.getState().setActiveAccountId(id);
      void queryClient.invalidateQueries({ queryKey: accountListQueryKey() });
    }
  });
};

export const useRemoveAccount = (): UseMutationResult<void, Error, string> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => removeAccount(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: accountListQueryKey() });
    }
  });
};
