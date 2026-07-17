import { FolderPlus, GitBranch } from 'lucide-react';
import type { FC } from 'react';

import { Button, Empty } from '@/shared/ui';

import type { NoReposStateProps } from '../types';

export const NoReposState: FC<NoReposStateProps> = ({ onAddRepo, onClone }) => (
  <div className="flex flex-1 items-center justify-center p-6">
    <Empty
      icon={<FolderPlus aria-hidden="true" className="size-6" />}
      title="No repositories yet"
      description="Add a local repository or clone a remote one to get started."
      action={
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onAddRepo}
            leftIcon={<FolderPlus aria-hidden="true" className="size-4" />}
          >
            Add repo
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={onClone}
            leftIcon={<GitBranch aria-hidden="true" className="size-4" />}
          >
            Clone
          </Button>
        </div>
      }
    />
  </div>
);

NoReposState.displayName = 'NoReposState';