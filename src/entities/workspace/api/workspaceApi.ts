import type {
  Workspace,
  WorkspaceCreateArgs,
  WorkspaceListResult
} from '../model/types';

export type { Workspace, WorkspaceListResult };

const getBridge = (): Window['api'] | null => {
  if (typeof window === 'undefined') return null;
  if (!('api' in window)) return null;
  return window.api;
};

export const listWorkspaces = async (): Promise<WorkspaceListResult> => {
  const api = getBridge();
  if (!api?.fsWorkspaceList) return [];
  const result = await api.fsWorkspaceList();
  if (!Array.isArray(result)) return [];
  return result as WorkspaceListResult;
};

export const createWorkspace = async (
  args: WorkspaceCreateArgs
): Promise<Workspace | null> => {
  const api = getBridge();
  if (!api?.fsWorkspaceCreate) return null;
  const result = await api.fsWorkspaceCreate(args);
  if (!result || typeof result !== 'object') return null;
  return result as Workspace;
};

export const selectDirectory = async (): Promise<string | null> => {
  const api = getBridge();
  if (!api?.fsSelectDirectory) return null;
  return api.fsSelectDirectory();
};