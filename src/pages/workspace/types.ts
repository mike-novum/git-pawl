import type { Repository } from '@/entities/repository';
import type { Workspace } from '@/entities/workspace';

export type WorkspacePageProps = Record<string, never>;

export type WorkspaceHeroProps = {
  workspace: Workspace;
  repoCount: number;
  modifiedCount: number;
  sizeBytes: number | null;
  onSettings: () => void;
};

export type WorkspaceToolbarProps = {
  query: string;
  onQueryChange: (q: string) => void;
  grouped: boolean;
  onGroupedChange: (g: boolean) => void;
  onAddRepo: () => void;
  onClone: () => void;
};

export type RepoGroupProps = {
  name: string;
  repos: Repository[];
  sizeBytesByRepo: Map<string, number>;
  onRepoClick: (repo: Repository) => void;
};

export type RepoCardProps = {
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
  onDelete: () => void;
};
