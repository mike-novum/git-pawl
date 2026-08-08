import {
  useMutation,
  useQueryClient,
  type UseMutationResult
} from '@tanstack/react-query';

export type GitFetchInput = {
  repoPath: string;
};

export type GitFetchResult = void;

const FETCH_QUERY_KEYS = [
  'current-branch',
  'branch-list',
  'git-log',
  'branch-mainlines'
] as const;

const invokeFetch = async (input: GitFetchInput): Promise<GitFetchResult> => {
  if (typeof window === 'undefined' || !('api' in window)) {
    throw new Error('IPC bridge is unavailable');
  }
  await window.api.gitFetch({ repoPath: input.repoPath });
};

export type UseGitFetchResult = {
  mutate: UseMutationResult<GitFetchResult, Error, GitFetchInput>['mutate'];
  mutateAsync: UseMutationResult<
    GitFetchResult,
    Error,
    GitFetchInput
  >['mutateAsync'];
  isPending: boolean;
  isError: boolean;
  error: Error | null;
  reset: () => void;
};

export const useGitFetch = (): UseGitFetchResult => {
  const queryClient = useQueryClient();

  const mutation = useMutation<GitFetchResult, Error, GitFetchInput>({
    mutationFn: invokeFetch,
    onSuccess: (_data, variables) => {
      const { repoPath } = variables;
      for (const key of FETCH_QUERY_KEYS) {
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