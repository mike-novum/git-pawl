import type { FileChange } from './types';

import { listCommitFiles, listFileChanges } from '../api';

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

export const commitFilesQueryKey = (
  repoPath: string,
  commitHash: string
): readonly [string, string, string] =>
  ['commit-files', repoPath, commitHash] as const;

export const fetchCommitFiles = async (
  repoPath: string,
  commitHash: string,
  signal?: AbortSignal
): Promise<FileChange[]> => {
  if (signal?.aborted) return [];
  try {
    return await listCommitFiles(repoPath, commitHash);
  } catch {
    return [];
  }
};
