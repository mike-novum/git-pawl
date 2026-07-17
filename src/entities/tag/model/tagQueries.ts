import type { Tag } from './types';

import { listTags } from '../api';

export const tagListQueryKey = (
  repoPath: string
): readonly [string, string] => ['tag-list', repoPath] as const;

export const fetchTagList = async (
  repoPath: string,
  signal?: AbortSignal
): Promise<Tag[]> => {
  if (signal?.aborted) return [];
  const promise = listTags(repoPath);
  if (!promise || typeof (promise as Promise<unknown>).then !== 'function') {
    return [];
  }
  return promise.catch(() => []);
};
