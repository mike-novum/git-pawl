import { listAccounts } from '../api';

import type { Account } from './types';

export const accountListQueryKey = (): readonly ['accounts'] =>
  ['accounts'] as const;

export const fetchAccountList = async (
  signal?: AbortSignal
): Promise<Account[]> => {
  if (signal?.aborted) return [];
  const promise = listAccounts();
  if (!promise || typeof (promise as Promise<unknown>).then !== 'function') {
    return [];
  }
  return promise.catch(() => []);
};
