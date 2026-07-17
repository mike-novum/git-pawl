import { useEffect, useState } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';

import { useAccountList, type Account } from '@/entities/account';
import { useCloneRepo, type UseCloneRepoResult } from '@/features/clone-repo';
import {
  useAccountRepos,
  type AccountReposProvider,
  type RepoInfo
} from '@/features/account-repos';

export type CloneFromRepoInput = {
  repo: RepoInfo;
  destPath: string;
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

export const useCloneFromRepo = (): UseCloneFromRepoResult => {
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
