import { Cat } from 'lucide-react';
import type { FC } from 'react';

import { Button } from '@/shared/ui';

import type { EmptyWorkspacesProps } from '../types';

export const EmptyWorkspaces: FC<EmptyWorkspacesProps> = ({ onCreate }) => (
  <div className="flex flex-1 items-center justify-center px-8 py-16">
    <div className="flex max-w-2xl flex-col items-center gap-8 text-center md:flex-row md:items-center md:text-left">
      <div
        className="relative flex size-60 shrink-0 items-center justify-center rounded-full"
        style={{
          background:
            'radial-gradient(circle, oklch(0.74 0.18 50 / 0.35) 0%, transparent 70%)'
        }}
      >
        <Cat aria-hidden="true" className="text-primary/90 size-24" strokeWidth={1.5} />
      </div>
      <div className="flex flex-col items-center gap-4 md:items-start">
        <h1 className="text-foreground text-3xl font-semibold tracking-tight">
          Create your first workspace
        </h1>
        <p className="text-muted-foreground max-w-md text-sm">
          Workspaces group your local repositories. Pick a folder and we'll scan
          it for git repos automatically.
        </p>
        <Button type="button" size="lg" onClick={onCreate}>
          Create workspace
        </Button>
      </div>
    </div>
  </div>
);

EmptyWorkspaces.displayName = 'EmptyWorkspaces';
