import { FolderPlus } from 'lucide-react';
import type { FC } from 'react';

import { Button, Empty } from '@/shared/ui';

import type { NoWorkspaceStateProps } from '../types';

export const NoWorkspaceState: FC<NoWorkspaceStateProps> = ({ onCreate }) => (
  <div className="flex flex-1 items-center justify-center p-6">
    <Empty
      icon={<FolderPlus aria-hidden="true" className="size-6" />}
      title="No active workspace"
      description="Create or pick a workspace to see its repositories here."
      action={
        <Button type="button" variant="primary" onClick={onCreate}>
          <FolderPlus aria-hidden="true" className="size-4" />
          New workspace
        </Button>
      }
    />
  </div>
);

NoWorkspaceState.displayName = 'NoWorkspaceState';