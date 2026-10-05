import type { FC } from 'react';

import { WorkspaceIcon } from '@/entities/workspace';

import type { WorkspaceHeroProps } from '../types';

export const WorkspaceHero: FC<WorkspaceHeroProps> = ({ workspace, iconPath }) => (
  <header className="flex items-center gap-3">
    <WorkspaceIcon workspace={workspace} iconPath={iconPath} size="md" />
    <h1 className="text-foreground text-2xl font-semibold tracking-tight">
      {workspace.name}
    </h1>
  </header>
);

WorkspaceHero.displayName = 'WorkspaceHero';