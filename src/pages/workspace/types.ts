import type { Repository } from '@/entities/repository';
import type { Workspace } from '@/entities/workspace';

export type WorkspaceViewMode = 'grid' | 'list';

export type WorkspacePageProps = Record<string, never>;

export type WorkspaceToolbarProps = {
  path: string;
  query: string;
  onQueryChange: (q: string) => void;
  grouped: boolean;
  onGroupedChange: (g: boolean) => void;
  viewMode?: WorkspaceViewMode;
  onViewModeChange?: (m: WorkspaceViewMode) => void;
  onAddRepo: () => void;
  onClone: () => void;
  totalReposCount?: number;
  filteredReposCount?: number;
};

export type RepoGroupProps = {
  name: string;
  repos: Repository[];
  viewMode?: WorkspaceViewMode;
  onRepoClick: (repo: Repository) => void;
  onAddRepo: () => void;
};

export type RepoCardProps = {
  repo: Repository;
  sizeBytes: number | null;
  onClick: () => void;
};

export type RepoRowProps = {
  repo: Repository;
  sizeBytes: number | null;
  onClick: () => void;
};

export type EmptyWorkspaceProps = {
  onAddRepo: () => void;
  onClone: () => void;
};

export type WorkspaceSettingsDrawerProps = {
  workspace: Workspace;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (name: string) => void;
  onIconChange?: (iconPath: string) => void;
  onDelete: () => void;
};
