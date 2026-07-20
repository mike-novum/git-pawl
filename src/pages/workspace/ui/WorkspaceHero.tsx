import { Settings } from 'lucide-react';
import type { FC } from 'react';

import { WorkspaceIcon } from '@/entities/workspace';

import type { WorkspaceHeroProps } from '../types';

export const WorkspaceHero: FC<WorkspaceHeroProps> = ({
  workspace,
  iconPath,
  onSettings
}) => (
  <header className="flex items-center justify-between gap-4">
    <div className="flex items-center gap-3">
      <WorkspaceIcon workspace={workspace} iconPath={iconPath} size="md" />
      <h1 className="text-foreground text-2xl font-semibold tracking-tight">
        {workspace.name}
      </h1>
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