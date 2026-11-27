import type { Workspace } from '@/entities/workspace';

export type AppSidebarProps = {
  className?: string;
};

export type SidebarWorkspaceItemProps = {
  workspace: Workspace;
  activeWorkspaceId: string | null;
  routeWorkspaceId: string | null;
  activeRepoPath: string | null;
  onSelectWorkspace: (workspaceId: string) => void;
  onSelectRepo: (workspaceId: string, repoPath: string) => void;
};
