import { FolderPlus, GitBranch } from 'lucide-react';
import type { FC } from 'react';

import { Button } from '@/shared/ui';
import { cn } from '@/shared/lib/theme';

import type { WorkspaceHeaderProps } from '../types';

export const WorkspaceHeader: FC<WorkspaceHeaderProps> = ({
  name,
  path,
  onAddRepo,
  onClone,
  className
}) => {
  return (
    <header
      className={cn(
        'flex flex-wrap items-start justify-between gap-3',
        className
      )}
    >
      <div className="flex min-w-0 flex-col gap-1">
        <h1 className="text-foreground truncate text-2xl font-semibold tracking-tight">
          {name}
        </h1>
        <p
          className="text-muted-foreground truncate font-mono text-xs"
          title={path}
        >
          {path}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
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
    </header>
  );
};

WorkspaceHeader.displayName = 'WorkspaceHeader';