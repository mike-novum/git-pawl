import { useMemo } from 'react';
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
  repositoryListQueryKey,
  repositoryQueryKey
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
const DISABLED_REPOSITORY_KEY = ['repository', 'disabled'] as const;

export const useRepositoryStatus = (
  repoPath: string | null
): UseQueryResult<GitStatus | null> => {
  const options = useMemo(
    () => ({
      queryKey: repoPath
        ? gitStatusQueryKey(repoPath)
        : DISABLED_STATUS_KEY,
      queryFn: ({ signal }: { signal?: AbortSignal }): Promise<GitStatus | null> =>
        repoPath ? fetchGitStatus(repoPath, signal) : Promise.resolve(null),
      enabled: Boolean(repoPath)
    }),
    [repoPath]
  );
  return useQuery(options);
};

export const useRepositorySize = (
  repoPath: string | null
): UseQueryResult<RepoSize | null> => {
  const options = useMemo(
    () => ({
      queryKey: repoPath
        ? repoSizeQueryKey(repoPath)
        : DISABLED_SIZE_KEY,
      queryFn: ({ signal }: { signal?: AbortSignal }): Promise<RepoSize | null> =>
        repoPath ? fetchRepoSize(repoPath, signal) : Promise.resolve(null),
      enabled: Boolean(repoPath),
      refetchInterval: 30_000,
      refetchIntervalInBackground: false
    }),
    [repoPath]
  );
  return useQuery(options);
};

export const useRepository = (repoPath: string | null): RepositoryQueryResult => {
  const statusQuery = useRepositoryStatus(repoPath);
  const sizeQuery = useRepositorySize(repoPath);

  const options = useMemo(
    () => ({
      queryKey: repoPath
        ? repositoryQueryKey(repoPath)
        : DISABLED_REPOSITORY_KEY,
      queryFn: async ({ signal }: { signal?: AbortSignal }): Promise<Repository | null> => {
        if (!repoPath) return null;
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
      },
      enabled: Boolean(repoPath)
    }),
    [repoPath]
  );

  const repoQuery = useQuery(options);

  const isLoading =
    Boolean(repoPath) &&
    (statusQuery.isLoading || sizeQuery.isLoading || repoQuery.isLoading);
  const isError = statusQuery.isError || sizeQuery.isError || repoQuery.isError;
  const error =
    (statusQuery.error as Error | null) ??
    (sizeQuery.error as Error | null) ??
    (repoQuery.error as Error | null) ??
    null;

  const refetch = (): void => {
    void statusQuery.refetch();
    void sizeQuery.refetch();
    void repoQuery.refetch();
  };

  return { data: repoQuery.data ?? null, isLoading, isError, error, refetch };
};

export const useRepositoryList = (
  workspacePath: string | null,
  extraRepoPaths: string[] = []
): UseQueryResult<Repository[]> =>
  useQuery({
    queryKey: workspacePath
      ? repositoryListQueryKey(workspacePath)
      : DISABLED_LIST_KEY,
    queryFn: async ({ signal }) => {
      if (!workspacePath) return [];
      const detected = await detectRepos(workspacePath, { signal });
      const seen = new Set<string>();
      const paths: string[] = [];
      for (const candidate of [...detected, ...extraRepoPaths]) {
        if (typeof candidate !== 'string' || candidate.length === 0) continue;
        if (seen.has(candidate)) continue;
        seen.add(candidate);
        paths.push(candidate);
      }
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