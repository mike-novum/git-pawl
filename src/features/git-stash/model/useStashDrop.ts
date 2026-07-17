import {
  useMutation,
  useQueryClient,
  type UseMutationResult
} from '@tanstack/react-query';

import type { StashInput } from './types';

export type StashDropInput = StashInput & {
  ref?: string;
};

export type StashResult = void;

const STASH_QUERY_KEYS = ['git-status'] as const;

const invokeStash = async (input: StashDropInput): Promise<StashResult> => {
  if (typeof window === 'undefined' || !('api' in window)) {
    throw new Error('IPC bridge is unavailable');
  }
  const args: {
    repoPath: string;
    action: 'drop';
    ref?: string;
  } = {
    repoPath: input.repoPath,
    action: 'drop'
  };
  if (input.ref) args.ref = input.ref;
  await window.api.gitStash(args);
};

export type UseStashDropResult = {
  mutate: UseMutationResult<StashResult, Error, StashDropInput>['mutate'];
  mutateAsync: UseMutationResult<
    StashResult,
    Error,
    StashDropInput
  >['mutateAsync'];
  isPending: boolean;
  isError: boolean;
  error: Error | null;
  reset: () => void;
};

export const useStashDrop = (): UseStashDropResult => {
  const queryClient = useQueryClient();

  const mutation = useMutation<StashResult, Error, StashDropInput>({
    mutationFn: invokeStash,
    onSuccess: (_data, variables) => {
      const { repoPath } = variables;
      for (const key of STASH_QUERY_KEYS) {
        void queryClient.invalidateQueries({ queryKey: [key, repoPath] });
      }
    }
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    reset: () => {
      mutation.reset();
    }
  };
};