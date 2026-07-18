import { useEffect, useState } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';

import { useAccountList, type Account } from '@/entities/account';

export type CloneFromRepoInput = {
  repo: RepoInfo;
  destPath: string;
};

export type UseCloneRepoInput = {
  url: string;
  destPath: string;
};

export type UseCloneRepoOptions = {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
};

export type UseCloneRepoResult = {
  mutate: (input: UseCloneRepoInput, options?: UseCloneRepoOptions) => void;
  isPending: boolean;
  error: Error | null;
  progress: string | null;
};

export type AccountReposProvider = 'github' | 'gitlab';

export type RepoInfo = {
  id: string;
  name: string;
  fullName: string;
  url: string;
  defaultBranch: string;
  isPrivate: boolean;
};

export type AccountReposArgs = {
  provider: AccountReposProvider;
  accountId: string;
};

export type UseCloneFromRepoDeps = {
  useCloneRepo: () => UseCloneRepoResult;
  useAccountRepos: (args: AccountReposArgs) => UseQueryResult<RepoInfo[]>;
};

export type UseCloneFromRepoResult = {
  accounts: Account[];
  accountsQuery: UseQueryResult<Account[]>;
  selectedAccount: Account | null;
  selectedProvider: AccountReposProvider | null;
  selectedAccountId: string | null;
  selectAccount: (id: string | null) => void;
  repos: RepoInfo[];
  reposQuery: UseQueryResult<RepoInfo[]>;
  clone: UseCloneRepoResult;
  cloningRepoId: string | null;
  setCloningRepoId: (id: string | null) => void;
};

export const buildCloneDestPath = (
  workspacePath: string,
  repoName: string
): string => {
  const trimmed = repoName.replace(/^\/+|\/+$/g, '');
  const root = workspacePath.replace(/\/+$/, '');
  if (!root) return trimmed;
  if (!trimmed) return root;
  return `${root}/${trimmed}`;
};

const NOOP_USE_CLONE_REPO = (): UseCloneRepoResult => ({
  mutate: () => undefined,
  isPending: false,
  error: null,
  progress: null
});

const EMPTY_REPOS_QUERY = {
  data: [],
  isLoading: false,
  isError: false,
  isPending: false,
  isFetching: false,
  isRefetching: false,
  status: 'success',
  error: null,
  fetchStatus: 'idle'
} as unknown as UseQueryResult<RepoInfo[]>;

const NOOP_USE_ACCOUNT_REPOS = (
  _args: AccountReposArgs
): UseQueryResult<RepoInfo[]> => EMPTY_REPOS_QUERY;

export const useCloneFromRepo = (
  deps?: Partial<UseCloneFromRepoDeps>
): UseCloneFromRepoResult => {
  const useCloneRepo = deps?.useCloneRepo ?? NOOP_USE_CLONE_REPO;
  const useAccountRepos = deps?.useAccountRepos ?? NOOP_USE_ACCOUNT_REPOS;

  const accountsQuery = useAccountList();
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [cloningRepoId, setCloningRepoId] = useState<string | null>(null);
  const clone = useCloneRepo();

  const accounts = accountsQuery.data ?? [];
  const selectedAccount =
    accounts.find((account) => account.id === selectedAccountId) ?? null;

  const provider: AccountReposProvider | null = selectedAccount
    ? selectedAccount.provider
    : null;

  const reposQuery = useAccountRepos(
    provider && selectedAccount
      ? { provider, accountId: selectedAccount.id }
      : { provider: 'github', accountId: '__none__' }
  );

  useEffect(() => {
    if (selectedAccountId && !selectedAccount) {
      setSelectedAccountId(null);
    }
  }, [selectedAccount, selectedAccountId]);

  const selectAccount = (id: string | null): void => {
    setSelectedAccountId(id);
    setCloningRepoId(null);
  };

  return {
    accounts,
    accountsQuery,
    selectedAccount,
    selectedProvider: provider,
    selectedAccountId,
    selectAccount,
    repos: reposQuery.data ?? [],
    reposQuery,
    clone,
    cloningRepoId,
    setCloningRepoId
  };
};
