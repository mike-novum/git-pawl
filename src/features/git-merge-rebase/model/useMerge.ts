import {
  useMutation,
  useQueryClient,
  type UseMutationResult
} from '@tanstack/react-query';

export type GitMergeInput = {
  repoPath: string;
  branch: string;
  noFF?: boolean;
  message?: string;
};

export type GitMergeResult = void;

const MERGE_QUERY_KEYS = ['git-status', 'branches', 'commits'] as const;

const invokeMerge = async (input: GitMergeInput): Promise<GitMergeResult> => {
  if (typeof window === 'undefined' || !('api' in window)) {
    throw new Error('IPC bridge is unavailable');
  }
  const args: { repoPath: string; branch: string; noFF?: boolean; message?: string } = {
    repoPath: input.repoPath,
    branch: input.branch
  };
  if (input.noFF) args.noFF = input.noFF;
  if (input.message) args.message = input.message;
  await window.api.gitMerge(args);
};

export type UseGitMergeResult = {
  mutate: UseMutationResult<GitMergeResult, Error, GitMergeInput>['mutate'];
  mutateAsync: UseMutationResult<
    GitMergeResult,
    Error,
    GitMergeInput
  >['mutateAsync'];
  isPending: boolean;
  isError: boolean;
  error: Error | null;
  reset: () => void;
};

export const useMerge = (): UseGitMergeResult => {
  const queryClient = useQueryClient();

  const mutation = useMutation<GitMergeResult, Error, GitMergeInput>({
    mutationFn: invokeMerge,
    onSuccess: (_data, variables) => {
      const { repoPath } = variables;
      for (const key of MERGE_QUERY_KEYS) {
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