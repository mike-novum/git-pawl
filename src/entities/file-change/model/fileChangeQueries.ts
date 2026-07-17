import type { FileChange } from './types';

import { listFileChanges } from '../api';

export const fileChangesQueryKey = (
  repoPath: string
): readonly [string, string] => ['file-changes', repoPath] as const;

export const fetchFileChanges = async (
  repoPath: string,
  signal?: AbortSignal
): Promise<FileChange[]> => {
  if (signal?.aborted) return [];
  try {
    return await listFileChanges(repoPath);
  } catch {
    return [];
  }
};
