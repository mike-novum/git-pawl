import type { Commit } from '@electron/shared/types/git';

import { getCommitList } from '../api';

export const commitListQueryKey = (
  repoPath: string,
  maxCount?: number
): readonly [string, string, number?] =>
  maxCount !== undefined
    ? (['commit-list', repoPath, maxCount] as const)
    : (['commit-list', repoPath] as const);

export const fetchCommitList = async (
  repoPath: string,
  maxCount?: number,
  signal?: AbortSignal
): Promise<Commit[]> => {
  if (signal?.aborted) return [];
  const options = maxCount !== undefined ? { maxCount } : {};
  const promise = getCommitList(repoPath, options);
  if (!promise || typeof (promise as Promise<unknown>).then !== 'function') {
    return [];
  }
  return promise.catch(() => []);
};
