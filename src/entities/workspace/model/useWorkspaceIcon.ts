import { useMutation, type UseMutationResult } from '@tanstack/react-query';

import { storeSet } from '@/shared/api';

import type { WorkspaceIconInput } from './types';

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
> =>
  useMutation({
    mutationFn: setWorkspaceIcon
  });
