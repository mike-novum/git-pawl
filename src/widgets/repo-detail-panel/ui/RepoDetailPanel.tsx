import {
  Copy,
  FileText,
  GitBranch,
  RotateCcw,
  Scissors,
  Trash2,
  Wand2
} from 'lucide-react';
import type { FC } from 'react';

import { Button } from '@/shared/ui';
import { cn } from '@/shared/lib/theme';

import type { RepoDetailPanelProps } from '../types';

const formatDate = (ts: number): string =>
  new Date(ts).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

export const RepoDetailPanel: FC<RepoDetailPanelProps> = ({
  commit,
  onCopyHash,
  onCreatePatch,
  onRevert,
  onCherryPick,
  onResetToHere,
  uncommittedCount,
  onCommit,
  onStash,
  onDiscard,
  className
}) => {
  if (!commit) {
    return (
      <aside
        className={cn(
          'bg-surface border-border flex h-full w-96 shrink-0 flex-col overflow-hidden border-l',
          className
        )}
      >
        <div className="text-muted-foreground flex flex-1 items-center justify-center p-6 text-center text-sm">
          Select a commit to see details.
        </div>
        <footer className="border-border border-t p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground text-xs">
              Uncommitted:{' '}
              <span className="text-foreground font-medium">{uncommittedCount}</span>
            </span>
            <div className="flex gap-1">
              <Button type="button" size="sm" variant="secondary" onClick={onStash}>
                Stash
              </Button>
              <Button type="button" size="sm" onClick={onCommit}>
                Commit
              </Button>
            </div>
          </div>
        </footer>
      </aside>
    );
  }

  return (
    <aside
      className={cn(
        'bg-surface border-border flex h-full w-96 shrink-0 flex-col overflow-hidden border-l',
        className
      )}
    >
      <div className="flex flex-1 flex-col gap-4 overflow-auto p-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-foreground text-base font-semibold leading-tight">
            {commit.subject}
          </h2>
          <p className="text-muted-foreground text-xs">
            {commit.author} · {formatDate(commit.timestamp)}
          </p>
          <button
            type="button"
            onClick={() => onCopyHash(commit.hash)}
            className="text-muted-foreground hover:text-foreground inline-flex w-fit items-center gap-1 font-mono text-xs transition-colors"
          >
            <Copy aria-hidden="true" className="size-3" />
            {commit.shortHash}
          </button>
        </div>

        <div className="flex flex-wrap gap-1">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => onCreatePatch(commit.hash)}
          >
            <FileText aria-hidden="true" className="size-3.5" /> Patch
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => onCherryPick(commit.hash)}
          >
            <Scissors aria-hidden="true" className="size-3.5" /> Cherry-pick
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => onRevert(commit.hash)}
          >
            <RotateCcw aria-hidden="true" className="size-3.5" /> Revert
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => onResetToHere(commit.hash)}
          >
            <Wand2 aria-hidden="true" className="size-3.5" /> Reset
          </Button>
        </div>

        <div className="bg-surface-elevated text-muted-foreground rounded-md p-3 text-xs">
          <p>
            <GitBranch aria-hidden="true" className="mr-1 inline size-3" />
            parents: {commit.parents.length}
          </p>
          <p className="mt-1">lane: {commit.lane}</p>
        </div>
      </div>

      <footer className="border-border border-t p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground text-xs">
            Uncommitted:{' '}
            <span className="text-foreground font-medium">{uncommittedCount}</span>
          </span>
          <div className="flex gap-1">
            <Button type="button" size="sm" variant="ghost" onClick={onDiscard}>
              <Trash2 aria-hidden="true" className="size-3.5" />
            </Button>
            <Button type="button" size="sm" variant="secondary" onClick={onStash}>
              Stash
            </Button>
            <Button type="button" size="sm" onClick={onCommit}>
              Commit
            </Button>
          </div>
        </div>
      </footer>
    </aside>
  );
};

RepoDetailPanel.displayName = 'RepoDetailPanel';
