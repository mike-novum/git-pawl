import type { FC } from 'react';
import { ChevronRight } from 'lucide-react';

import { Badge } from '@/shared/ui';

import type { RepositoryBreadcrumbsProps } from './types';

export const RepositoryBreadcrumbs: FC<RepositoryBreadcrumbsProps> = ({
  repoPath,
  repoName,
  owningWorkspace,
  onNavigateWorkspaces,
  onSelectWorkspace
}) => (
  <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5">
    <button
      type="button"
      onClick={onNavigateWorkspaces}
      className="text-muted-foreground hover:bg-surface-elevated hover:text-foreground rounded-md px-2 py-1 text-sm transition-colors duration-(--duration-fast)"
    >
      Workspaces
    </button>

    <ChevronRight
      aria-hidden="true"
      className="text-muted-foreground size-3.5 shrink-0"
    />

    {owningWorkspace ? (
      <>
        <button
          type="button"
          onClick={() => onSelectWorkspace(owningWorkspace)}
          className="text-muted-foreground hover:bg-surface-elevated hover:text-foreground max-w-44 truncate rounded-md px-2 py-1 text-sm transition-colors duration-(--duration-fast)"
          title={owningWorkspace.name}
        >
          {owningWorkspace.name}
        </button>

        <ChevronRight
          aria-hidden="true"
          className="text-muted-foreground size-3.5 shrink-0"
        />
      </>
    ) : null}

    {repoName ? (
      <Badge
        variant="outline"
        size="sm"
        className="text-foreground max-w-64 truncate font-medium"
        title={repoPath ?? repoName}
      >
        {repoName}
      </Badge>
    ) : null}
  </nav>
);

RepositoryBreadcrumbs.displayName = 'RepositoryBreadcrumbs';
