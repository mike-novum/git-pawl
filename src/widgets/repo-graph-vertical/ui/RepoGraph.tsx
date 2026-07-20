import { useMemo, type FC } from 'react';

import { cn } from '@/shared/lib/theme';
import { Spinner } from '@/shared/ui/spinner';

import type { RepoGraphProps } from '../types';
import { computeLayout } from '../lib/computeLayout';
import { CommitRow } from './CommitRow';

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
    <div
      className={cn('bg-surface h-full overflow-auto', className)}
      aria-label="Commit graph"
    >
      <ul className="min-w-0" style={{ minHeight: graphLayout.height }}>
        {graphLayout.rows.map((row, rowIndex) => (
          <CommitRow
            key={row.commit.hash}
            row={row}
            rowIndex={rowIndex}
            graphWidth={graphLayout.width}
            selectedHash={selectedHash}
            onSelect={onSelect}
          />
        ))}
      </ul>
    </div>
  );
};

RepoGraph.displayName = 'RepoGraph';
