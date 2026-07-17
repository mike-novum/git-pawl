import {
  useMutation,
  useQueryClient,
  type UseMutationResult
} from '@tanstack/react-query';

export type GitAmendInput = {
  repoPath: string;
  message?: string;
  noVerify?: boolean;
};

export type GitAmendResult = void;

const AMEND_QUERY_KEYS = ['git-status', 'commits'] as const;

type AmendBridge = {
  gitAmend: (args: GitAmendInput) => Promise<unknown>;
};

const getAmendBridge = (): AmendBridge | null => {
  if (typeof window === 'undefined' || !('api' in window)) return null;
  return window.api as unknown as AmendBridge;
};

const invokeAmend = async (input: GitAmendInput): Promise<GitAmendResult> => {
  const bridge = getAmendBridge();
  if (!bridge) {
    throw new Error('IPC bridge is unavailable');
  }
  await bridge.gitAmend(input);
};

export type UseGitAmendResult = {
  mutate: UseMutationResult<GitAmendResult, Error, GitAmendInput>['mutate'];
  mutateAsync: UseMutationResult<
    GitAmendResult,
    Error,
    GitAmendInput
  >['mutateAsync'];
  isPending: boolean;
  isError: boolean;
  error: Error | null;
  reset: () => void;
};

export const useAmend = (): UseGitAmendResult => {
  const queryClient = useQueryClient();

  const mutation = useMutation<GitAmendResult, Error, GitAmendInput>({
    mutationFn: invokeAmend,
    onSuccess: (_data, variables) => {
      const { repoPath } = variables;
      for (const key of AMEND_QUERY_KEYS) {
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
