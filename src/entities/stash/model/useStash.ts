import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { fetchStashList, stashListQueryKey } from './stashQueries';
import type { StashEntry } from './types';

const DISABLED_LIST_KEY = ['stash-list', 'disabled'] as const;

export const useStashList = (
  repoPath: string | null
): UseQueryResult<StashEntry[]> =>
  useQuery({
    queryKey: repoPath ? stashListQueryKey(repoPath) : DISABLED_LIST_KEY,
    queryFn: ({ signal }) =>
      repoPath ? fetchStashList(repoPath, signal) : Promise.resolve([]),
    enabled: Boolean(repoPath)
  });
