export type Workspace = {
  id: string;
  name: string;
  path: string;
  createdAt: number;
};

export type WorkspaceListResult = Workspace[];

export type WorkspaceCreateArgs = { path: string; name?: string };

<<<<<<< HEAD
export type WorkspaceRemoveArgs = { id: string };
=======
export type WorkspaceIconInput = {
  workspaceId: string;
  iconPath: string;
};
>>>>>>> worktree-agent-a67d2d3688724655b
