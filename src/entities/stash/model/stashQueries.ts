import type { StashEntry } from './types';

import { listStash } from '../api';

export const stashListQueryKey = (
  repoPath: string
): readonly [string, string] => ['stash-list', repoPath] as const;

export const fetchStashList = async (
  repoPath: string,
  signal?: AbortSignal
): Promise<StashEntry[]> => {
  if (signal?.aborted) return [];
  try {
    return await listStash(repoPath);
  } catch {
    return [];
  }
};
