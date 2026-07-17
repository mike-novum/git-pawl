import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import type { Commit } from '@electron/shared/types/git';

import { commitListQueryKey, fetchCommitList } from './commitQueries';

const DISABLED_LIST_KEY = ['commit-list', 'disabled'] as const;

export const useCommitList = (
  repoPath: string | null,
  options: { maxCount?: number } = {}
): UseQueryResult<Commit[]> =>
  useQuery({
    queryKey:
      repoPath
        ? commitListQueryKey(repoPath, options.maxCount)
        : DISABLED_LIST_KEY,
    queryFn: ({ signal }) =>
      repoPath
        ? fetchCommitList(repoPath, options.maxCount, signal)
        : Promise.resolve([]),
    enabled: Boolean(repoPath)
  });
