import { Octokit } from '@octokit/rest';
import { app } from 'electron';
import Store from 'electron-store';

import type { Account } from '../../../shared/types/account';
import type { RepoInfo } from '../../../shared/types/git-host';

import { storeSet } from '../store';

type StoredAccount = { token: string; account: Account };

type AccountsStore = Record<string, StoredAccount>;

const STORE_NAME = 'git-pawl-accounts';

const ENCRYPTION_KEY = 'git-pawl-account-store-v1';

const PER_PAGE = 100;

let store: Store<AccountsStore> | null = null;

const getStore = (): Store<AccountsStore> => {
  if (!store) {
    store = new Store<AccountsStore>({
      name: STORE_NAME,
      cwd: app.getPath('userData'),
      encryptionKey: ENCRYPTION_KEY
    });
  }
  return store;
};

const formatAuthError = (err: unknown): Error => {
  if (err && typeof err === 'object' && 'status' in err) {
    const status = (err as { status?: number }).status;
    if (status === 401) {
      return new Error('Invalid or expired GitHub token');
    }
    if (status === 403) {
      return new Error('GitHub token lacks required permissions');
    }
    if (typeof status === 'number') {
      return new Error(`GitHub authentication failed (HTTP ${status})`);
    }
  }
  if (err instanceof Error) {
    return new Error(`GitHub authentication failed: ${err.message}`);
  }
  return new Error('GitHub authentication failed');
};

const readAllGitHubAccounts = (): Account[] => {
  const data = getStore().store;
  const result: Account[] = [];
  for (const value of Object.values(data)) {
    if (value && typeof value === 'object' && 'account' in value) {
      const stored = value as StoredAccount;
      if (stored.account && stored.account.provider === 'github') {
        result.push(stored.account);
      }
    }
  }
  return result;
};

export const connectGitHub = async (token: string): Promise<Account> => {
  const trimmed = token.trim();
  if (trimmed.length === 0) {
    throw new Error('GitHub token must not be empty');
  }

  const octokit = new Octokit({ auth: trimmed });

  let user: Awaited<ReturnType<typeof octokit.users.getAuthenticated>>['data'];
  try {
    const result = await octokit.users.getAuthenticated();
    user = result.data;
  } catch (err) {
    throw formatAuthError(err);
  }

  if (!user.login) {
    throw new Error('GitHub response missing user login');
  }

  const account: Account = {
    id: `github:${user.login}`,
    provider: 'github',
    login: user.login,
    displayName: user.name ?? user.login,
    avatarUrl: user.avatar_url,
    email: user.email ?? null,
    scopes: ['repo'],
    addedAt: Date.now()
  };

  getStore().set(account.id, { token: trimmed, account });

  return account;
};

export const listGitHubAccounts = (): Account[] => readAllGitHubAccounts();

export const connectGitHubWithToken = async (token: string): Promise<Account> => {
  const account = await connectGitHub(token);
  storeSet(`github:active:${account.id}`, true);
  return account;
};

export const getGitHubOctokit = (accountId: string): Octokit | null => {
  const entry = getStore().get(accountId);
  if (!entry?.token) {
    return null;
  }
  return new Octokit({ auth: entry.token });
};

export const listGitHubRepos = async (accountId: string): Promise<RepoInfo[]> => {
  const octokit = getGitHubOctokit(accountId);
  if (!octokit) {
    throw new Error('Account not found');
  }

  const repos = await octokit.paginate(octokit.repos.listForAuthenticatedUser, {
    per_page: PER_PAGE
  });

  return repos.map((r) => ({
    id: String(r.id),
    name: r.name,
    fullName: r.full_name,
    defaultBranch: r.default_branch,
    isPrivate: r.private,
    url: r.html_url
  }));
};

export const disconnectGitHub = (accountId: string): boolean => {
  const entry = getStore().get(accountId);
  if (!entry) {
    return false;
  }
  getStore().delete(accountId);
  return true;
};
