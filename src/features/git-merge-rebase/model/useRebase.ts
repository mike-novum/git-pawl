import {
  useMutation,
  useQueryClient,
  type UseMutationResult
} from '@tanstack/react-query';

export type GitRebaseInput = {
  repoPath: string;
  branch: string;
  onto?: string;
};

export type GitRebaseResult = void;

const REBASE_QUERY_KEYS = ['git-status', 'branches', 'commits'] as const;

const invokeRebase = async (input: GitRebaseInput): Promise<GitRebaseResult> => {
  if (typeof window === 'undefined' || !('api' in window)) {
    throw new Error('IPC bridge is unavailable');
  }
  const args: { repoPath: string; branch: string; onto?: string } = {
    repoPath: input.repoPath,
    branch: input.branch
  };
  if (input.onto) args.onto = input.onto;
  await window.api.gitRebase(args);
};

export type UseGitRebaseResult = {
  mutate: UseMutationResult<GitRebaseResult, Error, GitRebaseInput>['mutate'];
  mutateAsync: UseMutationResult<
    GitRebaseResult,
    Error,
    GitRebaseInput
  >['mutateAsync'];
  isPending: boolean;
  isError: boolean;
  error: Error | null;
  reset: () => void;
};

export const useRebase = (): UseGitRebaseResult => {
  const queryClient = useQueryClient();

  const mutation = useMutation<GitRebaseResult, Error, GitRebaseInput>({
    mutationFn: invokeRebase,
    onSuccess: (_data, variables) => {
      const { repoPath } = variables;
      for (const key of REBASE_QUERY_KEYS) {
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