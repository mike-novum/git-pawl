import type { FC } from 'react';

import { EmptyState } from './EmptyState';
import type { WorkspacePageProps } from '../types';

export const WorkspacePage: FC<WorkspacePageProps> = () => {
  return (
    <div className="flex h-full w-full flex-col gap-4 p-6">
      <header className="flex items-center justify-between">
        <h1 className="text-foreground text-2xl font-semibold">Workspace</h1>
      </header>
      <EmptyState
        title="No repositories yet"
        description="Add a local folder or clone a remote repository to get started."
      />
    </div>
  );
};
