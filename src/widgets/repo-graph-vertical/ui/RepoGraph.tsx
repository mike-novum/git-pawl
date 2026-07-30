import { useMemo, type FC } from 'react';

import { cn } from '@/shared/lib/theme';
import { Spinner } from '@/shared/ui/spinner';

import type { RepoGraphProps } from '../types';
import { computeLayout } from '../lib/computeLayout';
import { RepoGraphTable } from './RepoGraphTable';

export const RepoGraph: FC<RepoGraphProps> = ({
  commits,
  layout,
  selectedHash,
  onSelect,
  isLoading = false,
  isError = false,
  className
}) => {
  const graphLayout = useMemo(
    () => layout ?? computeLayout(commits),
    [commits, layout]
  );

  if (isLoading) {
    return (
      <div
        className={cn(
          'bg-surface text-muted-foreground flex h-full items-center justify-center gap-2 text-sm',
          className
        )}
        role="status"
        aria-live="polite"
      >
        <Spinner className="size-4" />
        Loading commits...
      </div>
    );
  }

  if (isError) {
    return (
      <div
        className={cn(
          'bg-surface text-muted-foreground flex h-full items-center justify-center text-sm',
          className
        )}
        role="alert"
      >
        Failed to load commits.
      </div>
    );
  }

  if (graphLayout.rows.length === 0) {
    return (
      <div
        className={cn(
          'bg-surface text-muted-foreground flex h-full items-center justify-center text-sm',
          className
        )}
      >
        No commits
      </div>
    );
  }

  return (
    <RepoGraphTable
      layout={graphLayout}
      selectedHash={selectedHash}
      onSelect={onSelect}
      className={cn('bg-surface h-full', className)}
    />
  );
};

RepoGraph.displayName = 'RepoGraph';
