import {
  useMutation,
  useQueryClient,
  type UseMutationResult
} from '@tanstack/react-query';

import type { Account, AccountProvider } from '@/entities/account';
import { accountListQueryKey } from '@/entities/account';

export type ConnectAccountInput = {
  provider: AccountProvider;
  token: string;
  baseUrl?: string;
};

const invokeConnect = async (input: ConnectAccountInput): Promise<Account> => {
  if (typeof window === 'undefined' || !('api' in window)) {
    throw new Error('IPC bridge is unavailable');
  }

  const { provider, token } = input;
  if (provider === 'github') {
    const result = await window.api.authGithubComplete({ code: token });
    return result as Account;
  }

  const result = await window.api.authGitlabComplete({ code: token });
  return result as Account;
};

export const useConnectAccount = (): UseMutationResult<
  Account,
  Error,
  ConnectAccountInput
> => {
  const queryClient = useQueryClient();

  return useMutation<Account, Error, ConnectAccountInput>({
    mutationFn: (input) => invokeConnect(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: accountListQueryKey() });
    }
  });
};
