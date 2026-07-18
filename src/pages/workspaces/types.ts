import type { Workspace } from '@/entities/workspace';

export type WorkspaceTileProps = {
  workspace: Workspace;
  repoCount: number;
  sizeBytes: number | null;
  status: 'clean' | 'warning' | 'danger' | 'unknown';
  lastActivity: number | null;
  onOpen: () => void;
};

export type EmptyWorkspacesProps = {
  onCreate: () => void;
};

export type RecentActivityProps = {
  workspaceId: string;
  repoName: string;
  message: string;
  timestamp: number;
  href: string;
};
