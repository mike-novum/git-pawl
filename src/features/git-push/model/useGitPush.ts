import {
  useMutation,
  useQueryClient,
  type UseMutationResult
} from '@tanstack/react-query';

export type GitPushInput = {
  repoPath: string;
};

export type GitPushResult = void;

const PUSH_QUERY_KEYS = [
  'current-branch',
  'branch-list',
  'git-log',
  'branch-mainlines'
] as const;

const invokePush = async (input: GitPushInput): Promise<GitPushResult> => {
  if (typeof window === 'undefined' || !('api' in window)) {
    throw new Error('IPC bridge is unavailable');
  }
  await window.api.gitPush({ repoPath: input.repoPath });
};

export type UseGitPushResult = {
  mutate: UseMutationResult<GitPushResult, Error, GitPushInput>['mutate'];
  mutateAsync: UseMutationResult<
    GitPushResult,
    Error,
    GitPushInput
  >['mutateAsync'];
  isPending: boolean;
  isError: boolean;
  error: Error | null;
  reset: () => void;
};

export const useGitPush = (): UseGitPushResult => {
  const queryClient = useQueryClient();

  const mutation = useMutation<GitPushResult, Error, GitPushInput>({
    mutationFn: invokePush,
    onSuccess: (_data, variables) => {
      const { repoPath } = variables;
      for (const key of PUSH_QUERY_KEYS) {
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
