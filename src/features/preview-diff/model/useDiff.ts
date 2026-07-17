import {
  useQuery,
  type UseQueryResult
} from '@tanstack/react-query';

import type { DiffHunk } from '@electron/shared/types/git';

import { gitDiff } from '@/shared/api';

const DISABLED_KEY = ['git-diff', 'disabled'] as const;

export type UseDiffInput = {
  repoPath: string;
  range?: string;
  file?: string;
};

export const diffQueryKey = (input: UseDiffInput): readonly unknown[] =>
  [
    'git-diff',
    input.repoPath,
    input.range ?? '',
    input.file ?? ''
  ] as const;

const toDiffHunks = (value: unknown): DiffHunk[] => {
  if (!Array.isArray(value)) {
    return [];
  }
  return value as DiffHunk[];
};

const fetchDiff = async (
  input: UseDiffInput,
  signal?: AbortSignal
): Promise<DiffHunk[]> => {
  if (signal?.aborted) {
    return [];
  }

  const args = {
    repoPath: input.repoPath,
    ...(input.range ? { range: input.range } : {})
  };

  const result = await gitDiff(args);

  if (signal?.aborted) {
    return [];
  }

  const hunks = toDiffHunks(result);

  if (input.file) {
    return hunks.filter((hunk) => hunk.filePath === input.file);
  }

  return hunks;
};

export const useDiff = (input: UseDiffInput | null): UseQueryResult<DiffHunk[]> =>
  useQuery({
    queryKey: input ? diffQueryKey(input) : DISABLED_KEY,
    queryFn: ({ signal }) =>
      input ? fetchDiff(input, signal) : Promise.resolve([]),
    enabled: Boolean(input?.repoPath),
    refetchInterval: 5_000,
    refetchIntervalInBackground: false
  });
