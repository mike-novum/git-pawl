import {
  useMutation,
  useQueryClient,
  type UseMutationResult
} from '@tanstack/react-query';

export type GitResetMode = 'soft' | 'mixed' | 'hard';

export type GitResetInput = {
  repoPath: string;
  mode: GitResetMode;
  ref?: string;
};

export type GitResetResult = void;

const RESET_QUERY_KEYS = ['git-status', 'commits'] as const;

type ResetBridge = {
  gitReset: (args: GitResetInput) => Promise<unknown>;
};

const getResetBridge = (): ResetBridge | null => {
  if (typeof window === 'undefined' || !('api' in window)) return null;
  return window.api as unknown as ResetBridge;
};

const invokeReset = async (input: GitResetInput): Promise<GitResetResult> => {
  const bridge = getResetBridge();
  if (!bridge) {
    throw new Error('IPC bridge is unavailable');
  }
  await bridge.gitReset(input);
};

export type UseGitResetResult = {
  mutate: UseMutationResult<GitResetResult, Error, GitResetInput>['mutate'];
  mutateAsync: UseMutationResult<
    GitResetResult,
    Error,
    GitResetInput
  >['mutateAsync'];
  isPending: boolean;
  isError: boolean;
  error: Error | null;
  reset: () => void;
};

export const useReset = (): UseGitResetResult => {
  const queryClient = useQueryClient();

  const mutation = useMutation<GitResetResult, Error, GitResetInput>({
    mutationFn: invokeReset,
    onSuccess: (_data, variables) => {
      const { repoPath } = variables;
      for (const key of RESET_QUERY_KEYS) {
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
