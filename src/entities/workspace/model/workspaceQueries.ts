import { createWorkspace, listWorkspaces, removeWorkspace } from '../api';

import type { Workspace, WorkspaceCreateArgs, WorkspaceRemoveArgs } from './types';

export const WORKSPACE_LIST_QUERY_KEY = ['workspaces'] as const;

export const fetchWorkspaceList = async (
  signal?: AbortSignal
): Promise<Workspace[]> => {
  if (signal?.aborted) return [];
  const promise = listWorkspaces();
  if (!promise || typeof (promise as Promise<unknown>).then !== 'function') {
    return [];
  }
  return promise.catch(() => []);
};

export type WorkspaceCreateResult = Workspace | null;

export const fetchCreateWorkspace = async (
  args: WorkspaceCreateArgs
): Promise<WorkspaceCreateResult> => createWorkspace(args);

export const fetchRemoveWorkspace = async (
  args: WorkspaceRemoveArgs
): Promise<void> => removeWorkspace(args);