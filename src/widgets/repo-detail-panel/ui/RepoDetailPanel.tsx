import {
  Copy,
  FileText,
  GitBranch,
  RotateCcw,
  Scissors,
  Wand2
} from 'lucide-react';
import type { FC } from 'react';

import { useCommitFiles, FILE_CHANGE_STATUS_LABELS } from '@/entities/file-change';
import type { FileChange } from '@/entities/file-change';
import { cn } from '@/shared/lib/theme';
import { Button } from '@/shared/ui';
import { Empty } from '@/shared/ui/empty';
import { ScrollAreaRoot, ScrollAreaViewport } from '@/shared/ui/scroll-area';
import { Spinner } from '@/shared/ui/spinner';
import { CommitMessageForm } from '@/widgets/commit-message-form';
import { FileChangesPanel } from '@/widgets/file-changes-panel';
import type { CommitNode } from '@/widgets/repo-graph-vertical';

import type { RepoDetailPanelProps } from '../types';

const UNCOMMITTED_HASH = 'UNCOMMITTED';

const formatDate = (ts: number): string =>
  new Date(ts).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

const CommitFilesList: FC<{ changes: FileChange[] }> = ({ changes }) => (
  <ul className="flex flex-col gap-2 p-3" role="list">
    {changes.map((change) => (
      <li key={`${change.status}:${change.path}`}>
        <div className="flex items-center gap-3 rounded-md border border-border/60 bg-card px-3 py-2 text-sm">
          <span className="text-foreground inline-flex shrink-0 items-center rounded border border-border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide">
            {FILE_CHANGE_STATUS_LABELS[change.status]}
          </span>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="text-foreground truncate font-mono text-xs">
              {change.path}
            </span>
            {change.oldPath ? (
              <span className="text-muted-foreground truncate font-mono text-[10px]">
                from {change.oldPath}
              </span>
            ) : null}
          </div>
        </div>
      </li>
    ))}
  </ul>
);

export const RepoDetailPanel: FC<RepoDetailPanelProps> = ({
  commit,
  repoPath,
  onCopyHash,
  onCreatePatch,
  onCherryPick,
  onRevert,
  onResetToHere,
  onCommit,
  className
}) => {
  if (!commit) {
    return (
      <aside
        className={cn(
          'bg-surface border-border flex h-full w-96 shrink-0 flex-col items-center justify-center overflow-hidden border-l p-6',
          className
        )}
      >
        <Empty
          title="Select a commit"
          description="Pick a commit in the graph to see details and changed files."
        />
      </aside>
    );
  }

  if (commit.isUncommitted || commit.hash === UNCOMMITTED_HASH) {
    return (
      <UncommittedView
        repoPath={repoPath ?? null}
        onCommit={onCommit}
        className={className}
      />
    );
  }

  return (
    <CommitView
      commit={commit}
      repoPath={repoPath ?? null}
      onCopyHash={onCopyHash}
      onCreatePatch={onCreatePatch}
      onCherryPick={onCherryPick}
      onRevert={onRevert}
      onResetToHere={onResetToHere}
      className={className}
    />
  );
};

RepoDetailPanel.displayName = 'RepoDetailPanel';

type UncommittedViewProps = {
  repoPath: string | null;
  onCommit: (message: string) => void;
  className?: string;
};

const UncommittedView: FC<UncommittedViewProps> = ({
  repoPath,
  onCommit,
  className
}) => {
  const handleFormCommit = (message: { header: string }): void => {
    onCommit(message.header);
  };

  return (
    <aside
      className={cn(
        'bg-surface border-border flex h-full w-96 shrink-0 flex-col overflow-hidden border-l',
        className
      )}
    >
      <header className="border-border flex shrink-0 flex-col gap-1 border-b p-4">
        <h2 className="text-foreground text-base font-semibold leading-tight">
          Uncommited changes
        </h2>
        <p className="text-muted-foreground text-xs">Select files to commit</p>
      </header>

      <div className="min-h-0 flex-1 p-3">
        <FileChangesPanel repoPath={repoPath} className="h-full" />
      </div>

      <footer className="border-border max-h-[250px] shrink-0 overflow-auto border-t p-3">
        <CommitMessageForm onCommit={handleFormCommit} />
      </footer>
    </aside>
  );
};

UncommittedView.displayName = 'UncommittedView';

type CommitViewProps = {
  commit: CommitNode;
  repoPath: string | null;
  onCopyHash: (hash: string) => void;
  onCreatePatch: (hash: string) => void;
  onCherryPick: (hash: string) => void;
  onRevert: (hash: string) => void;
  onResetToHere: (hash: string) => void;
  className?: string;
};

const CommitView: FC<CommitViewProps> = ({
  commit,
  repoPath,
  onCopyHash,
  onCreatePatch,
  onCherryPick,
  onRevert,
  onResetToHere,
  className
}) => {
  const { data: files = [], isLoading, isError } = useCommitFiles(
    repoPath,
    commit.hash
  );

  return (
    <aside
      className={cn(
        'bg-surface border-border flex h-full w-96 shrink-0 flex-col overflow-hidden border-l',
        className
      )}
    >
      <header className="border-border flex shrink-0 flex-col gap-1 border-b p-4">
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
        <p className="text-muted-foreground flex items-center gap-2 font-mono text-xs">
          <GitBranch aria-hidden="true" className="size-3" />
          parents: {commit.parents.length} · lane: {commit.lane}
        </p>
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
              Loading files...
            </div>
          ) : isError ? (
            <Empty
              title="Failed to load files"
              description="Could not read commit changes."
              className="m-4"
            />
          ) : files.length === 0 ? (
            <Empty
              title="No files"
              description="This commit did not change any tracked files."
              className="m-4"
            />
          ) : (
            <CommitFilesList changes={files} />
          )}
        </ScrollAreaViewport>
      </ScrollAreaRoot>

      <footer className="border-border flex shrink-0 flex-wrap gap-1 border-t p-3">
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
      </footer>
    </aside>
  );
};

CommitView.displayName = 'CommitView';
