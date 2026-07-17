import { useMemo } from 'react';

import { useCommitList } from '@/entities/commit';

import type { CommitGraph } from '../lib';

import { buildGraph } from './buildGraph';

export type UseCommitGraphResult = {
  graph: CommitGraph | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
};

export const useCommitGraph = (
  repoPath: string | null,
  options: { maxCount?: number } = {}
): UseCommitGraphResult => {
  const query = useCommitList(repoPath, options);

  const graph = useMemo<CommitGraph | null>(
    () => (query.data ? buildGraph(query.data) : null),
    [query.data]
  );

  return {
    graph,
    isLoading: query.isLoading,
    isError: query.isError,
    error: (query.error as Error | null) ?? null,
    refetch: query.refetch
  };
};
