import type { Workspace } from '@/entities/workspace';

export type CommandPaletteProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onToggleSidebar?: () => void;
};

export type WorkspaceRepoItemsProps = {
  workspace: Workspace;
  onSelectRepo: (workspaceId: string, repoPath: string) => void;
};
