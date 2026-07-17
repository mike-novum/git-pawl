import { FolderGit2 } from 'lucide-react';
import type { FC } from 'react';

import { FetchButton } from '@/features/git-fetch';
import { PullButton } from '@/features/git-pull';
import { PushButton } from '@/features/git-push';
import { BranchBadge } from '@/entities/branch';
import { Badge } from '@/shared/ui';
import { cn } from '@/shared/lib/theme';

import type { RepoHeaderProps } from './types';

export const RepoHeader: FC<RepoHeaderProps> = ({
  name,
  path,
  branch,
  isDetached,
  repoPath,
  className
}) => {
  return (
    <header
      className={cn(
        'flex flex-wrap items-center justify-between gap-3 border-b border-border bg-card px-4 py-3',
        className
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="bg-muted text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-md">
          <FolderGit2 aria-hidden="true" className="size-5" />
        </div>
        <div className="flex min-w-0 flex-col">
          <h1 className="text-foreground truncate text-lg font-semibold tracking-tight">
            {name}
          </h1>
          <p
            className="text-muted-foreground truncate font-mono text-xs"
            title={path}
          >
            {path}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2">
        {branch ? (
          <BranchBadge
            name={isDetached ? `${branch} (detached)` : branch}
            current
          />
        ) : (
          <Badge variant="outline" size="sm">
            No branch
          </Badge>
        )}
        <FetchButton repoPath={repoPath ?? ''} disabled={!repoPath} />
        <PullButton repoPath={repoPath ?? ''} disabled={!repoPath} />
        <PushButton repoPath={repoPath ?? ''} disabled={!repoPath} />
      </div>
    </header>
  );
};

RepoHeader.displayName = 'RepoHeader';
