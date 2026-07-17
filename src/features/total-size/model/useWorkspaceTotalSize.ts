import { useMemo } from 'react';

import { useRepositoryList, type Repository } from '@/entities/repository';

export type WorkspaceTotalSizeSummary = {
  totalBytes: number;
  gitBytes: number;
  repoCount: number;
  reposResolved: number;
};

export type UseWorkspaceTotalSizeResult = {
  data: WorkspaceTotalSizeSummary | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
};

const sumRepositories = (repos: Repository[]): WorkspaceTotalSizeSummary => {
  let totalBytes = 0;
  let gitBytes = 0;
  let reposResolved = 0;

  for (const repo of repos) {
    if (typeof repo.sizeBytes === 'number') {
      totalBytes += repo.sizeBytes;
      reposResolved += 1;
    }
    if (typeof repo.gitBytes === 'number') {
      gitBytes += repo.gitBytes;
    }
  }

  return { totalBytes, gitBytes, repoCount: repos.length, reposResolved };
};

export const useWorkspaceTotalSize = (
  workspacePath: string | null
): UseWorkspaceTotalSizeResult => {
  const { data, isLoading, isError, error } = useRepositoryList(workspacePath);

  const result = useMemo<WorkspaceTotalSizeSummary | null>(() => {
    if (!workspacePath) return null;
    return sumRepositories(data ?? []);
  }, [workspacePath, data]);

  return {
    data: result,
    isLoading: Boolean(workspacePath) && isLoading,
    isError,
    error: (error as Error | null) ?? null
  };
};
