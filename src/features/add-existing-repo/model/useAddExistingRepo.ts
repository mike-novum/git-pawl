import {
  useMutation,
  useQueryClient,
  type UseMutationResult
} from '@tanstack/react-query';

import { gitStatus, storeGet, storeSet } from '@/shared/api';

export type AddExistingRepoInput = {
  workspaceId: string;
};

export type AddExistingRepoResult = {
  repoPath: string;
};

const extraReposKey = (workspaceId: string): string =>
  `workspace-extra-repos:${workspaceId}`;

const readExtraRepos = async (workspaceId: string): Promise<string[]> => {
  const raw = await storeGet<unknown>({ key: extraReposKey(workspaceId) });
  if (!Array.isArray(raw)) return [];
  return raw.filter((item): item is string => typeof item === 'string');
};

const writeExtraRepos = async (
  workspaceId: string,
  paths: string[]
): Promise<void> => {
  await storeSet({ key: extraReposKey(workspaceId), value: paths });
};

const getBridge = (): Window['api'] | null => {
  if (typeof window === 'undefined') return null;
  if (!('api' in window)) return null;
  return window.api;
};

const pickDirectory = async (): Promise<string | null> => {
  const bridge = getBridge();
  if (!bridge?.fsSelectDirectory) return null;
  return bridge.fsSelectDirectory();
};

const ensureGitRepo = async (repoPath: string): Promise<void> => {
  try {
    await gitStatus({ repoPath });
  } catch {
    throw new Error(`Not a git repository: ${repoPath}`);
  }
};

export type UseAddExistingRepoResult = UseMutationResult<
  AddExistingRepoResult | null,
  Error,
  AddExistingRepoInput
>;

export const useAddExistingRepo = (): UseAddExistingRepoResult => {
  const queryClient = useQueryClient();

  return useMutation<AddExistingRepoResult | null, Error, AddExistingRepoInput>({
    mutationFn: async ({ workspaceId }) => {
      const picked = await pickDirectory();
      if (!picked) return null;

      await ensureGitRepo(picked);

      const existing = await readExtraRepos(workspaceId);
      if (existing.includes(picked)) {
        return null;
      }

      await writeExtraRepos(workspaceId, [...existing, picked]);

      return { repoPath: picked };
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ['workspace-extra-repos', variables.workspaceId]
      });
      void queryClient.invalidateQueries({ queryKey: ['repository-list'] });
    }
  });
};
