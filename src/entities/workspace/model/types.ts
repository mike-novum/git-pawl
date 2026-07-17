export type Workspace = {
  id: string;
  name: string;
  path: string;
  createdAt: number;
};

export type WorkspaceListResult = Workspace[];

export type WorkspaceCreateArgs = { path: string; name?: string };