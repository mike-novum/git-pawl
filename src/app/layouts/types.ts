import type { ReactNode } from 'react';

import type { Workspace } from '@/entities/workspace';

export type AppLayoutProps = {
  children?: ReactNode;
};

export type WorkspaceHeaderMetaProps = {
  workspaceId: string;
};

export type RepositoryBreadcrumbsProps = {
  repoPath: string | null;
  repoName: string | null;
  owningWorkspace: Workspace | null;
  onNavigateWorkspaces: () => void;
  onSelectWorkspace: (workspace: Workspace) => void;
};
