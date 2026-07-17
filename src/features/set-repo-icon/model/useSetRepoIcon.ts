import {
  useMutation,
  useQueryClient,
  type UseMutationResult
} from '@tanstack/react-query';

export type SetRepoIconInput = {
  repoPath: string;
  sourceImagePath: string;
};

export type SetRepoIconResult = void;

const REPO_ICONS_QUERY_KEYS = [
  'repository',
  'repository-list',
  'git-status',
  'repo-size'
] as const;

const invokeSetRepoIcon = async (input: SetRepoIconInput): Promise<SetRepoIconResult> => {
  if (typeof window === 'undefined' || !('api' in window)) {
    throw new Error('IPC bridge is unavailable');
  }
  await window.api.fsIcon({
    action: 'set',
    repoPath: input.repoPath,
    sourceImagePath: input.sourceImagePath
  });
};

export type UseSetRepoIconResult = UseMutationResult<
  SetRepoIconResult,
  Error,
  SetRepoIconInput
>;

export const useSetRepoIcon = (): UseSetRepoIconResult => {
  const queryClient = useQueryClient();

  return useMutation<SetRepoIconResult, Error, SetRepoIconInput>({
    mutationFn: invokeSetRepoIcon,
    onSuccess: (_data, variables) => {
      const { repoPath } = variables;
      for (const key of REPO_ICONS_QUERY_KEYS) {
        void queryClient.invalidateQueries({ queryKey: [key, repoPath] });
        void queryClient.invalidateQueries({ queryKey: [key] });
      }
    }
  });
};
