import {
  useMutation,
  useQueryClient,
  type UseMutationResult
} from '@tanstack/react-query';

export type GitPullInput = {
  repoPath: string;
};

export type GitPullResult = void;

const PULL_QUERY_KEYS = [
  'git-status',
  'branches',
  'commits'
] as const;

const invokePull = async (input: GitPullInput): Promise<GitPullResult> => {
  if (typeof window === 'undefined' || !('api' in window)) {
    throw new Error('IPC bridge is unavailable');
  }
  await window.api.gitPull({ repoPath: input.repoPath });
};

export type UseGitPullResult = {
  mutate: UseMutationResult<GitPullResult, Error, GitPullInput>['mutate'];
  mutateAsync: UseMutationResult<
    GitPullResult,
    Error,
    GitPullInput
  >['mutateAsync'];
  isPending: boolean;
  isError: boolean;
  error: Error | null;
  reset: () => void;
};

export const useGitPull = (): UseGitPullResult => {
  const queryClient = useQueryClient();

  const mutation = useMutation<GitPullResult, Error, GitPullInput>({
    mutationFn: invokePull,
    onSuccess: (_data, variables) => {
      const { repoPath } = variables;
      for (const key of PULL_QUERY_KEYS) {
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
