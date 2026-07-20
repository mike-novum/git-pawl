import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult
} from '@tanstack/react-query';

import { storeGet, storeSet } from '@/shared/api';

import type { WorkspaceIconInput } from './types';

export const WORKSPACE_ICON_QUERY_KEY = (
  workspaceId: string
): readonly [string, string] => ['workspace-icon', workspaceId] as const;

const DISABLED_KEY = ['workspace-icon', 'disabled'] as const;

export const fetchWorkspaceIcon = async (
  workspaceId: string
): Promise<string | null> => {
  const raw = await storeGet<unknown>({
    key: `workspace-icon:${workspaceId}`
  });
  return typeof raw === 'string' && raw.length > 0 ? raw : null;
};

export const useWorkspaceIcon = (
  workspaceId: string | null
): UseQueryResult<string | null> =>
  useQuery({
    queryKey: workspaceId
      ? WORKSPACE_ICON_QUERY_KEY(workspaceId)
      : DISABLED_KEY,
    queryFn: ({ signal }) => {
      if (!workspaceId) return Promise.resolve<string | null>(null);
      const inner = fetchWorkspaceIcon(workspaceId);
      return new Promise<string | null>((resolve, reject) => {
        if (signal?.aborted) {
          resolve(null);
          return;
        }
        inner.then(resolve).catch(reject);
      });
    },
    enabled: Boolean(workspaceId)
  });

export const setWorkspaceIcon = async ({
  workspaceId,
  iconPath
}: WorkspaceIconInput): Promise<void> => {
  await storeSet({
    key: `workspace-icon:${workspaceId}`,
    value: iconPath
  });
};

export const useSetWorkspaceIcon = (): UseMutationResult<
  void,
  Error,
  WorkspaceIconInput
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: setWorkspaceIcon,
    onSuccess: (_data, variables) => {
      queryClient.setQueryData<string | null>(
        WORKSPACE_ICON_QUERY_KEY(variables.workspaceId),
        variables.iconPath
      );
      void queryClient.invalidateQueries({
        queryKey: WORKSPACE_ICON_QUERY_KEY(variables.workspaceId)
      });
    }
  });
};
