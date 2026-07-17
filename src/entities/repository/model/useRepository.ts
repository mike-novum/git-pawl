import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import type { GitStatus } from '@electron/shared/types/git';
import type { RepoSize } from '@electron/shared/types/fs';

import { buildRepository, defaultIconPath, detectRepos } from '../lib';

import type { Repository } from './types';

import {
  fetchGitStatus,
  fetchRepoSize,
  gitStatusQueryKey,
  repoSizeQueryKey,
  repositoryListQueryKey
} from './repositoryQueries';

export type RepositoryQueryResult = {
  data: Repository | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
};

const DISABLED_STATUS_KEY = ['git-status', 'disabled'] as const;
const DISABLED_SIZE_KEY = ['repo-size', 'disabled'] as const;
const DISABLED_LIST_KEY = ['repository-list', 'disabled'] as const;

export const useRepositoryStatus = (
  repoPath: string | null
): UseQueryResult<GitStatus | null> =>
  useQuery({
    queryKey: repoPath ? gitStatusQueryKey(repoPath) : DISABLED_STATUS_KEY,
    queryFn: ({ signal }) =>
      repoPath ? fetchGitStatus(repoPath, signal) : Promise.resolve(null),
    enabled: Boolean(repoPath)
  });

export const useRepositorySize = (
  repoPath: string | null
): UseQueryResult<RepoSize | null> =>
  useQuery({
    queryKey: repoPath ? repoSizeQueryKey(repoPath) : DISABLED_SIZE_KEY,
    queryFn: ({ signal }) =>
      repoPath ? fetchRepoSize(repoPath, signal) : Promise.resolve(null),
    enabled: Boolean(repoPath),
    refetchInterval: 30_000,
    refetchIntervalInBackground: false
  });

export const useRepository = (repoPath: string | null): RepositoryQueryResult => {
  const statusQuery = useRepositoryStatus(repoPath);
  const sizeQuery = useRepositorySize(repoPath);

  const status = statusQuery.data ?? null;
  const size = sizeQuery.data ?? null;

  const data = repoPath
    ? buildRepository(repoPath, status, size, defaultIconPath(repoPath))
    : null;

  const isLoading = Boolean(repoPath) && (statusQuery.isLoading || sizeQuery.isLoading);
  const isError = statusQuery.isError || sizeQuery.isError;
  const error =
    (statusQuery.error as Error | null) ?? (sizeQuery.error as Error | null) ?? null;

  const refetch = (): void => {
    void statusQuery.refetch();
    void sizeQuery.refetch();
  };

  return { data, isLoading, isError, error, refetch };
};

export const useRepositoryList = (
  workspacePath: string | null
): UseQueryResult<Repository[]> =>
  useQuery({
    queryKey: workspacePath
      ? repositoryListQueryKey(workspacePath)
      : DISABLED_LIST_KEY,
    queryFn: async ({ signal }) => {
      if (!workspacePath) return [];
      const paths = await detectRepos(workspacePath, { signal });
      const repos = await Promise.all(
        paths.map(async (repoPath) => {
          const [status, size] = await Promise.all([
            fetchGitStatus(repoPath, signal).catch(() => null),
            fetchRepoSize(repoPath, signal).catch(() => null)
          ]);
          return buildRepository(
            repoPath,
            status,
            size,
            defaultIconPath(repoPath)
          );
        })
      );
      return repos;
    },
    enabled: Boolean(workspacePath)
  });