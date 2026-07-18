import { FolderOpen } from 'lucide-react';
import type { FC } from 'react';

import { Button } from '@/shared/ui';

import type { EmptyWorkspaceProps } from '../types';

export const EmptyWorkspace: FC<EmptyWorkspaceProps> = ({ onAddRepo, onClone }) => (
  <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 py-16 text-center">
    <div className="bg-surface-elevated text-muted-foreground flex size-16 items-center justify-center rounded-full">
      <FolderOpen aria-hidden="true" className="size-8" />
    </div>
    <div className="flex flex-col gap-1">
      <h2 className="text-foreground text-lg font-semibold">No repositories yet</h2>
      <p className="text-muted-foreground text-sm">
        Add an existing folder or clone a repository to get started.
      </p>
    </div>
    <div className="flex gap-2">
      <Button type="button" variant="secondary" onClick={onAddRepo}>
        Add repo
      </Button>
      <Button type="button" onClick={onClone}>
        Clone
      </Button>
    </div>
  </div>
);

EmptyWorkspace.displayName = 'EmptyWorkspace';
