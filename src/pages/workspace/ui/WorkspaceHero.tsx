import { Folder, Settings } from 'lucide-react';
import type { FC } from 'react';

import { formatBytes } from '@/entities/workspace';

import type { WorkspaceHeroProps } from '../types';

export const WorkspaceHero: FC<WorkspaceHeroProps> = ({
  workspace,
  repoCount,
  modifiedCount,
  sizeBytes,
  onSettings
}) => (
  <header className="flex items-start justify-between gap-4">
    <div className="flex items-start gap-3">
      <div className="bg-surface-elevated text-primary flex size-10 items-center justify-center rounded-lg">
        <Folder aria-hidden="true" className="size-5" />
      </div>
      <div className="flex flex-col gap-0.5">
        <h1 className="text-foreground text-2xl font-semibold tracking-tight">
          {workspace.name}
        </h1>
        <p
          className="text-muted-foreground/70 truncate font-mono text-xs"
          title={workspace.path}
        >
          {workspace.path}
        </p>
        <p className="text-muted-foreground text-xs">
          {repoCount} {repoCount === 1 ? 'repo' : 'repos'}
          {modifiedCount > 0 ? ` · ${modifiedCount} modified` : ''}
          {sizeBytes !== null ? ` · ${formatBytes(sizeBytes)}` : ''}
        </p>
      </div>
    </div>
    <button
      type="button"
      onClick={onSettings}
      aria-label="Workspace settings"
      className="text-muted-foreground hover:bg-surface-elevated hover:text-foreground flex size-8 items-center justify-center rounded-md transition-colors duration-(--duration-fast)"
    >
      <Settings aria-hidden="true" className="size-4" />
    </button>
  </header>
);

WorkspaceHero.displayName = 'WorkspaceHero';