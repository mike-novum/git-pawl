import type { FC } from 'react';

import { OpenInFinder } from '@/features/open-in-finder';
import { OpenInTerminal } from '@/features/open-in-terminal';
import { WorkspaceIcon } from '@/entities/workspace';

import type { WorkspaceHeroProps } from '../types';

export const WorkspaceHero: FC<WorkspaceHeroProps> = ({ workspace, iconPath }) => (
  <header className="flex items-center justify-between gap-4">
    <div className="flex items-center gap-3">
      <WorkspaceIcon workspace={workspace} iconPath={iconPath} size="md" />
      <h1 className="text-foreground text-2xl font-semibold tracking-tight">
        {workspace.name}
      </h1>
    </div>
    <div className="flex items-center gap-1">
      <OpenInFinder path={workspace.path} />
      <OpenInTerminal path={workspace.path} />
    </div>
  </header>
);

WorkspaceHero.displayName = 'WorkspaceHero';