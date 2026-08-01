export type Workspace = {
  id: string;
  name: string;
  path: string;
  createdAt: number;
};

export type WorkspaceListResult = Workspace[];

export type WorkspaceCreateArgs = { path: string; name?: string };

export type WorkspaceRemoveArgs = { id: string };

export type WorkspaceIconInput = {
  workspaceId: string;
  sourceImagePath: string;
};