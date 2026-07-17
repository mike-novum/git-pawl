import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult
} from '@tanstack/react-query';

export type ConfigScope = 'local' | 'global' | 'system';

export type GitConfigQueryArgs = {
  repoPath: string;
  key: string;
  scope?: ConfigScope;
};

export type SetRepoConfigInput = {
  repoPath: string;
  key: string;
  value: string;
  scope?: ConfigScope;
};

type GitConfigIpcArgs = {
  repoPath: string;
  key?: string;
  value?: string;
  scope?: ConfigScope;
  list?: boolean;
};

const GIT_CONFIG_KEY = 'git-config' as const;

export const gitConfigQueryKey = (
  args: GitConfigQueryArgs
): readonly [typeof GIT_CONFIG_KEY, string, string, ConfigScope | 'default'] => [
  GIT_CONFIG_KEY,
  args.repoPath,
  args.key,
  args.scope ?? 'default'
] as const;

const fetchGitConfig = async (
  args: GitConfigQueryArgs,
  signal?: AbortSignal
): Promise<string> => {
  if (signal?.aborted) return '';
  if (typeof window === 'undefined' || !('api' in window)) {
    return '';
  }
  const ipcArgs: GitConfigIpcArgs = {
    repoPath: args.repoPath,
    key: args.key
  };
  if (args.scope) ipcArgs.scope = args.scope;
  const result = await window.api.gitConfig(
    ipcArgs as unknown as { repoPath: string; key: string }
  );
  if (typeof result === 'string') return result;
  if (result && typeof result === 'object') {
    const map = result as Record<string, unknown>;
    const value = map[args.key];
    if (typeof value === 'string') return value;
  }
  return '';
};

export const useGitConfig = (
  args: GitConfigQueryArgs | null
): UseQueryResult<string> => {
  const enabled = Boolean(args && args.repoPath && args.key);
  return useQuery({
    queryKey: args ? gitConfigQueryKey(args) : [GIT_CONFIG_KEY, 'disabled'],
    queryFn: ({ signal }) =>
      enabled && args ? fetchGitConfig(args, signal) : Promise.resolve(''),
    enabled
  });
};

const invokeSetRepoConfig = async (
  input: SetRepoConfigInput
): Promise<void> => {
  if (typeof window === 'undefined' || !('api' in window)) {
    throw new Error('IPC bridge is unavailable');
  }
  const ipcArgs: GitConfigIpcArgs = {
    repoPath: input.repoPath,
    key: input.key,
    value: input.value
  };
  if (input.scope) ipcArgs.scope = input.scope;
  await window.api.gitConfig(
    ipcArgs as unknown as { repoPath: string; key: string; value: string }
  );
};

const invalidateConfigQueries = (
  queryClient: ReturnType<typeof useQueryClient>,
  repoPath: string,
  key: string
): void => {
  void queryClient.invalidateQueries({
    queryKey: [GIT_CONFIG_KEY, repoPath, key]
  });
};

export type UseSetRepoConfigResult = {
  mutate: UseMutationResult<void, Error, SetRepoConfigInput>['mutate'];
  mutateAsync: UseMutationResult<
    void,
    Error,
    SetRepoConfigInput
  >['mutateAsync'];
  isPending: boolean;
  isError: boolean;
  error: Error | null;
  reset: () => void;
};

export const useSetRepoConfig = (): UseSetRepoConfigResult => {
  const queryClient = useQueryClient();

  const mutation = useMutation<void, Error, SetRepoConfigInput>({
    mutationFn: invokeSetRepoConfig,
    onSuccess: (_data, variables) => {
      invalidateConfigQueries(
        queryClient,
        variables.repoPath,
        variables.key
      );
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
