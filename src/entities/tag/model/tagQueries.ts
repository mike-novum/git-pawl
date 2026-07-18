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
  try {
    const result = await listTags(repoPath);
    return Array.isArray(result) ? result : [];
  } catch {
    return [];
  }
};
