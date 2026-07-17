import type { GitStatus } from '@electron/shared/types/git';
import type { RepoSize } from '@electron/shared/types/fs';

import { getStatus, getSize } from '../api';

export const gitStatusQueryKey = (repoPath: string): readonly [string, string] =>
  ['git-status', repoPath] as const;

export const repoSizeQueryKey = (repoPath: string): readonly [string, string] =>
  ['repo-size', repoPath] as const;

export const repositoryQueryKey = (repoPath: string): readonly [string, string] =>
  ['repository', repoPath] as const;

export const repositoryListQueryKey = (
  workspacePath: string
): readonly [string, string] => ['repository-list', workspacePath] as const;

export const fetchGitStatus = async (
  repoPath: string,
  signal?: AbortSignal
): Promise<GitStatus | null> => {
  if (signal?.aborted) return null;
  const promise = getStatus(repoPath);
  if (!promise || typeof (promise as Promise<unknown>).then !== 'function') {
    return null;
  }
  return promise.catch(() => null);
};

export const fetchRepoSize = async (
  repoPath: string,
  signal?: AbortSignal
): Promise<RepoSize | null> => {
  if (signal?.aborted) return null;
  const promise = getSize(repoPath);
  if (!promise || typeof (promise as Promise<unknown>).then !== 'function') {
    return null;
  }
  return promise.catch(() => null);
};