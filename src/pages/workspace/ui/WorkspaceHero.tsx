import { Folder, Settings } from 'lucide-react';
import type { FC } from 'react';

import type { WorkspaceHeroProps } from '../types';

export const WorkspaceHero: FC<WorkspaceHeroProps> = ({ workspace, onSettings }) => (
  <header className="flex items-start justify-between gap-4">
    <div className="flex items-center gap-3">
      <div className="bg-surface-elevated text-primary flex size-10 items-center justify-center rounded-lg">
        <Folder aria-hidden="true" className="size-5" />
      </div>
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
