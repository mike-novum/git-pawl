import { CheckSquare, Square } from 'lucide-react';
import { useMemo } from 'react';
import type { FC } from 'react';

import { useFileChanges, useSelectedFiles } from '@/entities/file-change';
import type { FileChange } from '@/entities/file-change';
import { cn } from '@/shared/lib/theme';
import { Button } from '@/shared/ui/button';
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
  selectedFile,
  onSelectChange,
  className
}) => {
  const { data: changes = [], isLoading, isError } = useFileChanges(repoPath);
  const { count: stagedCount, isSelected, toggle, selectAll, deselectAll } = useSelectedFiles(
    repoPath ?? ''
  );

  const allPaths = useMemo(() => changes.map((c) => c.path), [changes]);
  const allStaged = allPaths.length > 0 && stagedCount === allPaths.length;
  const noneStaged = stagedCount === 0;

  const handleStageAll = (): void => {
    if (allPaths.length === 0) return;
    selectAll(allPaths);
  };

  const handleUnstageAll = (): void => {
    deselectAll();
  };

  const handleToggleStage = (path: string): void => {
    toggle(path);
  };

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
      <header className="flex flex-col gap-2 border-b border-border px-3 py-2 text-xs">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-foreground text-sm font-semibold">Changes</h2>
          <div className="text-muted-foreground flex items-center gap-2.5 font-mono text-[11px]">
            <span>
              total: <span className="text-foreground">{counts.total}</span>
            </span>
            <span>
              staged: <span className="text-emerald-600 dark:text-emerald-400">{stagedCount}</span>
            </span>
            <span>
              unstaged: <span className="text-amber-600 dark:text-amber-400">{Math.max(0, counts.total - stagedCount)}</span>
            </span>
          </div>
        </div>

        {repoPath && changes.length > 0 ? (
          <div className="flex items-center gap-1.5 pt-0.5">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleStageAll}
              disabled={allStaged || changes.length === 0}
              leftIcon={<CheckSquare aria-hidden="true" className="size-3.5" />}
              className="h-7 text-xs"
            >
              Stage all
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleUnstageAll}
              disabled={noneStaged}
              leftIcon={<Square aria-hidden="true" className="size-3.5" />}
              className="h-7 text-xs"
            >
              Unstage all
            </Button>
          </div>
        ) : null}
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
                    isSelectedForDiff={selectedFile === change.path}
                    isStagedForCommit={isSelected(change.path)}
                    onSelect={onSelectChange}
                    onToggleStage={repoPath ? handleToggleStage : undefined}
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
