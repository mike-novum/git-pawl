import {
  useMutation,
  useQueryClient,
  type UseMutationResult
} from '@tanstack/react-query';

import type { StashInput } from './types';

export type StashPushInput = StashInput & {
  message?: string;
};

export type StashResult = void;

const STASH_QUERY_KEYS = ['git-status'] as const;

const invokeStash = async (input: StashPushInput): Promise<StashResult> => {
  if (typeof window === 'undefined' || !('api' in window)) {
    throw new Error('IPC bridge is unavailable');
  }
  const args: {
    repoPath: string;
    action: 'push';
    message?: string;
  } = {
    repoPath: input.repoPath,
    action: 'push'
  };
  if (input.message) args.message = input.message;
  await window.api.gitStash(args);
};

export type UseStashPushResult = {
  mutate: UseMutationResult<StashResult, Error, StashPushInput>['mutate'];
  mutateAsync: UseMutationResult<
    StashResult,
    Error,
    StashPushInput
  >['mutateAsync'];
  isPending: boolean;
  isError: boolean;
  error: Error | null;
  reset: () => void;
};

export const useStashPush = (): UseStashPushResult => {
  const queryClient = useQueryClient();

  const mutation = useMutation<StashResult, Error, StashPushInput>({
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