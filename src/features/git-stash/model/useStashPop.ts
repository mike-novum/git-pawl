import {
  useMutation,
  useQueryClient,
  type UseMutationResult
} from '@tanstack/react-query';

import type { StashInput } from './types';

export type StashPopInput = StashInput & {
  ref?: string;
};

export type StashResult = void;

const STASH_QUERY_KEYS = ['git-status'] as const;

const invokeStash = async (input: StashPopInput): Promise<StashResult> => {
  if (typeof window === 'undefined' || !('api' in window)) {
    throw new Error('IPC bridge is unavailable');
  }
  const args: {
    repoPath: string;
    action: 'pop';
    ref?: string;
  } = {
    repoPath: input.repoPath,
    action: 'pop'
  };
  if (input.ref) args.ref = input.ref;
  await window.api.gitStash(args);
};

export type UseStashPopResult = {
  mutate: UseMutationResult<StashResult, Error, StashPopInput>['mutate'];
  mutateAsync: UseMutationResult<
    StashResult,
    Error,
    StashPopInput
  >['mutateAsync'];
  isPending: boolean;
  isError: boolean;
  error: Error | null;
  reset: () => void;
};

export const useStashPop = (): UseStashPopResult => {
  const queryClient = useQueryClient();

  const mutation = useMutation<StashResult, Error, StashPopInput>({
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