import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult
} from '@tanstack/react-query';

import { useAppStore } from '@/app/store';

import { createWorkspace, selectDirectory } from '../api';

import {
  fetchCreateWorkspace,
  fetchWorkspaceList,
  WORKSPACE_LIST_QUERY_KEY
} from './workspaceQueries';
import type { Workspace, WorkspaceCreateArgs } from './types';

export type UseCreateWorkspaceResult = UseMutationResult<
  Workspace | null,
  Error,
  WorkspaceCreateArgs | undefined
>;

export const useWorkspaceList = (): UseQueryResult<Workspace[]> =>
  useQuery({
    queryKey: WORKSPACE_LIST_QUERY_KEY,
    queryFn: ({ signal }) => fetchWorkspaceList(signal)
  });

export const useWorkspace = (id: string | null): Workspace | null => {
  const query = useWorkspaceList();
  if (!id) return null;
  return query.data?.find((workspace) => workspace.id === id) ?? null;
};

export const useActiveWorkspace = (): Workspace | null => {
  const activeId = useAppStore((state) => state.activeWorkspaceId);
  return useWorkspace(activeId);
};

export const useCreateWorkspace = (): UseCreateWorkspaceResult => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (args?: WorkspaceCreateArgs) => {
      let resolvedPath: string | null = args?.path ?? null;
      const resolvedName = args?.name;

      if (!resolvedPath) {
        resolvedPath = await selectDirectory();
        if (!resolvedPath) {
          return null;
        }
      }

      const workspace = await fetchCreateWorkspace({
        path: resolvedPath,
        ...(resolvedName !== undefined ? { name: resolvedName } : {})
      });

      if (workspace) {
        useAppStore.getState().setActiveWorkspaceId(workspace.id);
      }

      return workspace;
    },
    onSuccess: (workspace) => {
      if (workspace) {
        void queryClient.invalidateQueries({
          queryKey: WORKSPACE_LIST_QUERY_KEY
        });
      }
    }
  });
};

export type { Workspace };
export { createWorkspace };