import { Gitlab } from '@gitbeaker/node';
import { app } from 'electron';
import Store from 'electron-store';

import type { Account } from '../../../shared/types/account';
import type { RepoInfo } from '../../../shared/types/git-host';

import { storeSet } from '../store';

type StoredAccount = { token: string; baseUrl?: string; account: Account };

type AccountsStore = Record<string, StoredAccount>;

const STORE_NAME = 'git-pawl-accounts';

const ENCRYPTION_KEY = 'git-pawl-account-store-v1';

const PER_PAGE = 100;

const DEFAULT_HOST = 'https://gitlab.com';

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
  let status: number | undefined;
  if (err && typeof err === 'object') {
    const e = err as { response?: { statusCode?: number }; status?: number };
    if (typeof e.response?.statusCode === 'number') {
      status = e.response.statusCode;
    } else if (typeof e.status === 'number') {
      status = e.status;
    }
  }
  if (status === 401) {
    return new Error('Invalid or expired GitLab token');
  }
  if (status === 403) {
    return new Error('GitLab token lacks required permissions');
  }
  if (typeof status === 'number') {
    return new Error(`GitLab authentication failed (HTTP ${status})`);
  }
  if (err instanceof Error) {
    return new Error(`GitLab authentication failed: ${err.message}`);
  }
  return new Error('GitLab authentication failed');
};

const readAllGitLabAccounts = (): Account[] => {
  const data = getStore().store;
  const result: Account[] = [];
  for (const value of Object.values(data)) {
    if (value && typeof value === 'object' && 'account' in value) {
      const stored = value as StoredAccount;
      if (stored.account && stored.account.provider === 'gitlab') {
        result.push(stored.account);
      }
    }
  }
  return result;
};

export const connectGitLab = async (token: string, baseUrl?: string): Promise<Account> => {
  const trimmed = token.trim();
  if (trimmed.length === 0) {
    throw new Error('GitLab token must not be empty');
  }

  const host = baseUrl && baseUrl.trim().length > 0 ? baseUrl.trim() : DEFAULT_HOST;

  const gitlab = new Gitlab({ token: trimmed, host });

  let user: Awaited<ReturnType<typeof gitlab.Users.current>>;
  try {
    user = await gitlab.Users.current();
  } catch (err) {
    throw formatAuthError(err);
  }

  if (!user.username) {
    throw new Error('GitLab response missing user username');
  }

  const account: Account = {
    id: `gitlab:${user.username}`,
    provider: 'gitlab',
    login: user.username,
    displayName: user.name ?? user.username,
    avatarUrl: user.avatar_url ?? null,
    email: user.email ?? null,
    scopes: ['api'],
    addedAt: Date.now()
  };

  getStore().set(account.id, { token: trimmed, baseUrl: host, account });

  return account;
};

export const listGitLabAccounts = (): Account[] => readAllGitLabAccounts();

export const connectGitLabWithToken = async (token: string, baseUrl?: string): Promise<Account> => {
  const account = await connectGitLab(token, baseUrl);
  storeSet(`gitlab:active:${account.id}`, true);
  return account;
};

export const getGitLabClient = (accountId: string): InstanceType<typeof Gitlab> | null => {
  const entry = getStore().get(accountId);
  if (!entry?.token) {
    return null;
  }
  return new Gitlab({ token: entry.token, host: entry.baseUrl ?? DEFAULT_HOST });
};

export const listGitLabRepos = async (accountId: string): Promise<RepoInfo[]> => {
  const gitlab = getGitLabClient(accountId);
  if (!gitlab) {
    throw new Error('Account not found');
  }

  const projects = await gitlab.Projects.all({ membership: true, perPage: PER_PAGE });

  return projects.map((p) => ({
    id: String(p.id),
    name: p.path,
    fullName: p.path_with_namespace,
    defaultBranch: p.default_branch ?? 'main',
    isPrivate: p.visibility === 'private',
    url: p.web_url
  }));
};

export const disconnectGitLab = (accountId: string): boolean => {
  const entry = getStore().get(accountId);
  if (!entry) {
    return false;
  }
  getStore().delete(accountId);
  return true;
};
