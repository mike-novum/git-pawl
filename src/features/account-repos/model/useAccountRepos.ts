import {
  useQuery,
  type UseQueryResult
} from '@tanstack/react-query';

import { listGitHubRepos, listGitLabRepos } from '../api';

import type { AccountReposArgs, RepoInfo } from './types';

export const accountReposQueryKey = (
  provider: AccountReposArgs['provider'],
  accountId: string
): readonly ['account-repos', AccountReposArgs['provider'], string] =>
  ['account-repos', provider, accountId] as const;

const fetchAccountRepos = async (
  provider: AccountReposArgs['provider'],
  accountId: string,
  signal?: AbortSignal
): Promise<RepoInfo[]> => {
  if (signal?.aborted) return [];
  if (provider === 'github') {
    return listGitHubRepos(accountId);
  }
  return listGitLabRepos(accountId);
};

export const useAccountRepos = (
  args: AccountReposArgs
): UseQueryResult<RepoInfo[]> =>
  useQuery({
    queryKey: accountReposQueryKey(args.provider, args.accountId),
    queryFn: ({ signal }) => fetchAccountRepos(args.provider, args.accountId, signal)
  });