import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { fetchFileChanges, fileChangesQueryKey } from './fileChangeQueries';
import type { FileChange } from './types';

const DISABLED_KEY = ['file-changes', 'disabled'] as const;

export const useFileChanges = (
  repoPath: string | null
): UseQueryResult<FileChange[]> =>
  useQuery({
    queryKey: repoPath ? fileChangesQueryKey(repoPath) : DISABLED_KEY,
    queryFn: ({ signal }) =>
      repoPath ? fetchFileChanges(repoPath, signal) : Promise.resolve([]),
    enabled: Boolean(repoPath),
    refetchInterval: 5_000,
    refetchIntervalInBackground: false
  });
