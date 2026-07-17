import {
  useMutation,
  useQueryClient,
  type UseMutationResult
} from '@tanstack/react-query';

export type GitRevertInput = {
  repoPath: string;
  commit: string;
  noEdit?: boolean;
};

export type GitRevertResult = void;

const REVERT_QUERY_KEYS = ['git-status', 'commits'] as const;

type RevertBridge = {
  gitRevert: (args: GitRevertInput) => Promise<unknown>;
};

const getRevertBridge = (): RevertBridge | null => {
  if (typeof window === 'undefined' || !('api' in window)) return null;
  return window.api as unknown as RevertBridge;
};

const invokeRevert = async (input: GitRevertInput): Promise<GitRevertResult> => {
  const bridge = getRevertBridge();
  if (!bridge) {
    throw new Error('IPC bridge is unavailable');
  }
  await bridge.gitRevert(input);
};

export type UseGitRevertResult = {
  mutate: UseMutationResult<GitRevertResult, Error, GitRevertInput>['mutate'];
  mutateAsync: UseMutationResult<
    GitRevertResult,
    Error,
    GitRevertInput
  >['mutateAsync'];
  isPending: boolean;
  isError: boolean;
  error: Error | null;
  reset: () => void;
};

export const useRevert = (): UseGitRevertResult => {
  const queryClient = useQueryClient();

  const mutation = useMutation<GitRevertResult, Error, GitRevertInput>({
    mutationFn: invokeRevert,
    onSuccess: (_data, variables) => {
      const { repoPath } = variables;
      for (const key of REVERT_QUERY_KEYS) {
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
