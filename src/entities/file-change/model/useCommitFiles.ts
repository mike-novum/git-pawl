import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { commitFilesQueryKey, fetchCommitFiles } from './fileChangeQueries';
import type { FileChange } from './types';

const DISABLED_KEY = ['commit-files', 'disabled'] as const;

export const useCommitFiles = (
  repoPath: string | null,
  commitHash: string | null
): UseQueryResult<FileChange[]> =>
  useQuery({
    queryKey:
      repoPath && commitHash
        ? commitFilesQueryKey(repoPath, commitHash)
        : DISABLED_KEY,
    queryFn: ({ signal }) =>
      repoPath && commitHash
        ? fetchCommitFiles(repoPath, commitHash, signal)
        : Promise.resolve([]),
    enabled: Boolean(repoPath) && Boolean(commitHash)
  });
