import { useMemo } from 'react';
import type { FC } from 'react';

import { useFileChanges } from '@/entities/file-change';
import type { FileChange } from '@/entities/file-change';
import { cn } from '@/shared/lib/theme';
import { Empty } from '@/shared/ui/empty';
import {
  ScrollAreaRoot,
  ScrollAreaViewport
} from '@/shared/ui/scroll-area';
import { Spinner } from '@/shared/ui/spinner';

import { FileChangeListRow } from './FileChangeListRow';
import type { FileChangesPanelProps } from './types';

const isStaged = (change: FileChange): boolean => change.isStaged;
const isUnstaged = (change: FileChange): boolean => change.isUnstaged;

export const FileChangesPanel: FC<FileChangesPanelProps> = ({
  repoPath,
  onSelectChange,
  className
}) => {
  const { data: changes = [], isLoading, isError } = useFileChanges(repoPath);

  const counts = useMemo(() => {
    let staged = 0;
    let unstaged = 0;
    for (const change of changes) {
      if (isStaged(change)) staged += 1;
      if (isUnstaged(change)) unstaged += 1;
    }
    return { total: changes.length, staged, unstaged };
  }, [changes]);

  return (
    <section
      aria-label="File changes"
      className={cn(
        'bg-card text-card-foreground flex h-full w-full flex-col rounded-md border border-border',
        className
      )}
    >
      <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-2 text-xs">
        <h2 className="text-foreground text-sm font-semibold">Changes</h2>
        <div className="text-muted-foreground flex items-center gap-3 font-mono">
          <span>
            total: <span className="text-foreground">{counts.total}</span>
          </span>
          <span>
            staged: <span className="text-emerald-600 dark:text-emerald-400">{counts.staged}</span>
          </span>
          <span>
            unstaged: <span className="text-amber-600 dark:text-amber-400">{counts.unstaged}</span>
          </span>
        </div>
      </header>

      <ScrollAreaRoot className="min-h-0 flex-1">
        <ScrollAreaViewport className="h-full">
          {isLoading ? (
            <div
              className="text-muted-foreground flex h-full items-center justify-center gap-2 p-6 text-sm"
              role="status"
              aria-live="polite"
            >
              <Spinner className="size-4" />
              Loading changes...
            </div>
          ) : isError ? (
            <Empty
              title="Failed to load changes"
              description="Check repository path and try again."
              className="m-4"
            />
          ) : changes.length === 0 ? (
            <Empty
              title="No changes"
              description={
                repoPath
                  ? 'Working tree is clean.'
                  : 'Select a repository to see its changes.'
              }
              className="m-4"
            />
          ) : (
            <ul className="flex flex-col gap-2 p-3" role="list">
              {changes.map((change) => (
                <li key={`${change.status}:${change.path}`}>
                  <FileChangeListRow
                    change={change}
                    onSelect={onSelectChange}
                  />
                </li>
              ))}
            </ul>
          )}
        </ScrollAreaViewport>
      </ScrollAreaRoot>
    </section>
  );
};

FileChangesPanel.displayName = 'FileChangesPanel';