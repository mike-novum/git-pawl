import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { fetchTagList, tagListQueryKey } from './tagQueries';
import type { Tag } from './types';

const DISABLED_LIST_KEY = ['tag-list', 'disabled'] as const;

export const useTags = (
  repoPath: string | null
): UseQueryResult<Tag[]> =>
  useQuery({
    queryKey: repoPath ? tagListQueryKey(repoPath) : DISABLED_LIST_KEY,
    queryFn: ({ signal }) =>
      repoPath ? fetchTagList(repoPath, signal) : Promise.resolve([]),
    enabled: Boolean(repoPath)
  });
