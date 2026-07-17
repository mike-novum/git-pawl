import type {
  Account,
  AccountListResult,
  AccountRemoveArgs,
  AccountSetActiveArgs
} from '../model/types';

export type { Account, AccountListResult };

const getAccountApi = (): Window['api'] | null => {
  if (typeof window === 'undefined') return null;
  if (!('api' in window)) return null;
  return window.api;
};

export const listAccounts = async (): Promise<AccountListResult> => {
  const api = getAccountApi();
  if (!api?.accountList) return [];
  const result = await api.accountList();
  if (!Array.isArray(result)) return [];
  return result as AccountListResult;
};

export const setActiveAccount = async (id: string): Promise<void> => {
  const api = getAccountApi();
  if (!api?.accountSetActive) return;
  const args: AccountSetActiveArgs = { id };
  await api.accountSetActive(args);
};

export const removeAccount = async (id: string): Promise<void> => {
  const api = getAccountApi();
  if (!api?.accountRemove) return;
  const args: AccountRemoveArgs = { id };
  await api.accountRemove(args);
};
