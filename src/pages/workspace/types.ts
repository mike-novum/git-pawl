import type { ReactNode } from 'react';

export type WorkspaceHeaderProps = {
  name: string;
  path: string;
  onAddRepo: () => void;
  onClone: () => void;
  className?: string;
};

export type RepoSearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export type RepoGridProps = {
  repos: import('@/entities/repository').Repository[];
  onRepoClick: (repo: import('@/entities/repository').Repository) => void;
  className?: string;
};

export type NoWorkspaceStateProps = {
  onCreate: () => void;
};

export type NoReposStateProps = {
  onAddRepo: () => void;
  onClone: () => void;
};

export type NoResultsStateProps = {
  query: string;
  onReset: () => void;
};

export type WorkspacePageProps = Record<string, never>;

export type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};