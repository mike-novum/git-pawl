import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { storeGet } from '@/shared/api';

export const WORKSPACE_EXTRA_REPOS_QUERY_KEY = (
  workspaceId: string
): readonly [string, string] => ['workspace-extra-repos', workspaceId] as const;

const DISABLED_KEY = ['workspace-extra-repos', 'disabled'] as const;

export const fetchWorkspaceExtraRepoPaths = async (
  workspaceId: string
): Promise<string[]> => {
  const raw = await storeGet<unknown>({
    key: `workspace-extra-repos:${workspaceId}`
  });
  if (!Array.isArray(raw)) return [];
  return raw.filter((item): item is string => typeof item === 'string');
};

export const useWorkspaceExtraRepoPaths = (
  workspaceId: string | null
): UseQueryResult<string[]> =>
  useQuery({
    queryKey: workspaceId
      ? WORKSPACE_EXTRA_REPOS_QUERY_KEY(workspaceId)
      : DISABLED_KEY,
    queryFn: ({ signal }) => {
      if (!workspaceId) return Promise.resolve<string[]>([]);
      const inner = fetchWorkspaceExtraRepoPaths(workspaceId);
      return new Promise<string[]>((resolve, reject) => {
        if (signal?.aborted) {
          resolve([]);
          return;
        }
        inner.then(resolve).catch(reject);
      });
    },
    enabled: Boolean(workspaceId)
  });
