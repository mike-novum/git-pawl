import {
  ArrowLeft,
  ChevronDown,
  Copy,
  Eye,
  FileText,
  GitBranch,
  MoreHorizontal,
  RotateCcw,
  Scissors,
  Wand2
} from 'lucide-react';
import { useState } from 'react';
import type { FC, KeyboardEvent } from 'react';

import { useCommitFiles, FILE_CHANGE_STATUS_LABELS } from '@/entities/file-change';
import { DiffViewer } from '@/features/preview-diff';
import { cn } from '@/shared/lib/theme';
import { Button } from '@/shared/ui';
import {
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuPositioner,
  DropdownMenuRoot,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/shared/ui/dropdown-menu';
import { Empty } from '@/shared/ui/empty';
import { ScrollAreaRoot, ScrollAreaViewport } from '@/shared/ui/scroll-area';
import { Spinner } from '@/shared/ui/spinner';
import { CommitMessageForm } from '@/widgets/commit-message-form';
import { FileChangesPanel } from '@/widgets/file-changes-panel';

import type {
  CommitActionsMenuProps,
  CommitFilesListProps,
  CommitViewProps,
  RepoDetailPanelProps,
  UncommittedViewProps
} from '../types';

const UNCOMMITTED_HASH = 'UNCOMMITTED';

const formatDate = (ts: number): string =>
  new Date(ts).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

const CommitActionsMenu: FC<CommitActionsMenuProps> = ({
  commitHash,
  onCopyHash,
  onCreatePatch,
  onCherryPick,
  onRevert,
  onResetToHere
}) => (
  <DropdownMenuRoot>
    <DropdownMenuTrigger
      aria-label="Commit actions"
      className="inline-flex"
    >
      <span className="text-muted-foreground hover:text-foreground hover:bg-surface-elevated inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-card px-2.5 text-xs font-medium transition-colors cursor-pointer">
        <MoreHorizontal aria-hidden="true" className="size-4" />
        <span>Actions</span>
        <ChevronDown aria-hidden="true" className="size-3 opacity-60" />
      </span>
    </DropdownMenuTrigger>
    <DropdownMenuPortal>
      <DropdownMenuPositioner sideOffset={6} align="end">
        <DropdownMenuContent className="min-w-52">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Commit</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onCopyHash(commitHash)}>
              <Copy aria-hidden="true" className="mr-2 size-3.5" />
              Copy full hash
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuLabel>Upcoming actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onCreatePatch(commitHash)}>
              <FileText aria-hidden="true" className="mr-2 size-3.5" />
              Create patch
              <span className="text-muted-foreground ml-auto font-mono text-[10px] uppercase">
                Soon
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onCherryPick(commitHash)}>
              <Scissors aria-hidden="true" className="mr-2 size-3.5" />
              Cherry-pick
              <span className="text-muted-foreground ml-auto font-mono text-[10px] uppercase">
                Soon
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onRevert(commitHash)}>
              <RotateCcw aria-hidden="true" className="mr-2 size-3.5" />
              Revert commit
              <span className="text-muted-foreground ml-auto font-mono text-[10px] uppercase">
                Soon
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onResetToHere(commitHash)}>
              <Wand2 aria-hidden="true" className="mr-2 size-3.5" />
              Reset to here
              <span className="text-muted-foreground ml-auto font-mono text-[10px] uppercase">
                Soon
              </span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenuPositioner>
    </DropdownMenuPortal>
  </DropdownMenuRoot>
);

CommitActionsMenu.displayName = 'CommitActionsMenu';

const CommitFilesList: FC<CommitFilesListProps> = ({
  changes,
  selectedFile,
  onSelectFile
}) => (
  <ul className="flex flex-col gap-2 p-3" role="list">
    {changes.map((change) => {
      const isSelected = selectedFile === change.path;
      const interactive = Boolean(onSelectFile);

      const handleClick = (): void => {
        onSelectFile?.(change.path);
      };

      const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
        if (!interactive) return;
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelectFile?.(change.path);
        }
      };

      return (
        <li key={`${change.status}:${change.path}`}>
          <div
            role={interactive ? 'button' : undefined}
            tabIndex={interactive ? 0 : undefined}
            onClick={interactive ? handleClick : undefined}
            onKeyDown={interactive ? handleKeyDown : undefined}
            aria-label={`${FILE_CHANGE_STATUS_LABELS[change.status]}: ${change.path}`}
            className={cn(
              'flex items-center gap-3 rounded-md border border-border/60 bg-card px-3 py-2 text-sm transition-colors',
              interactive &&
                'hover:border-primary/60 hover:bg-accent/40 cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus:outline-none',
              isSelected && 'border-primary/80 bg-primary/10 ring-1 ring-primary/40'
            )}
          >
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
            {interactive ? (
              <Eye
                aria-hidden="true"
                className={cn(
                  'size-4 shrink-0',
                  isSelected ? 'text-primary' : 'text-muted-foreground'
                )}
              />
            ) : null}
          </div>
        </li>
      );
    })}
  </ul>
);

CommitFilesList.displayName = 'CommitFilesList';

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
          'bg-surface border-border flex h-full w-full min-w-0 flex-col items-center justify-center overflow-hidden border-l p-6',
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

const UncommittedView: FC<UncommittedViewProps> = ({
  repoPath,
  onCommit,
  className
}) => {
  const [activeTab, setActiveTab] = useState<'changes' | 'diff'>('changes');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const handleFormCommit = (message: { header: string }): void => {
    onCommit(message.header);
  };

  const handleSelectFile = (path: string): void => {
    setSelectedFile(path);
    setActiveTab('diff');
  };

  const handleBackToChanges = (): void => {
    setActiveTab('changes');
  };

  const handleClearSelection = (): void => {
    setSelectedFile(null);
    setActiveTab('changes');
  };

  return (
    <aside
      className={cn(
        'bg-surface border-border flex h-full w-full min-w-0 flex-col overflow-hidden border-l',
        className
      )}
    >
      <header className="border-border flex shrink-0 flex-col gap-2 border-b p-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-foreground text-base font-semibold leading-tight">
              Uncommitted changes
            </h2>
            <p className="text-muted-foreground text-xs">
              {selectedFile ? 'Inspecting file diff' : 'Select files to commit'}
            </p>
          </div>
          <div className="flex items-center rounded-lg border border-border bg-card p-0.5">
            <button
              type="button"
              onClick={handleBackToChanges}
              className={cn(
                'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                activeTab === 'changes'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Changes
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('diff')}
              disabled={!selectedFile}
              className={cn(
                'rounded-md px-2.5 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40',
                activeTab === 'diff'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Diff
            </button>
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col">
        {activeTab === 'diff' && selectedFile ? (
          <div className="flex h-full flex-col">
            <div className="border-border bg-card/60 flex items-center justify-between gap-2 border-b px-3 py-1.5 text-xs">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleBackToChanges}
                leftIcon={<ArrowLeft aria-hidden="true" className="size-3.5" />}
                className="h-7 text-xs"
              >
                Back to changes
              </Button>
              <span className="text-foreground max-w-[200px] truncate font-mono text-[11px]">
                {selectedFile}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClearSelection}
                className="text-muted-foreground hover:text-foreground h-7 text-xs"
              >
                Close diff
              </Button>
            </div>
            <div className="min-h-0 flex-1">
              {repoPath ? (
                <DiffViewer
                  repoPath={repoPath}
                  range="HEAD"
                  file={selectedFile}
                  className="h-full"
                />
              ) : null}
            </div>
          </div>
        ) : (
          <div className="min-h-0 flex-1 p-3">
            <FileChangesPanel
              repoPath={repoPath}
              selectedFile={selectedFile}
              onSelectChange={handleSelectFile}
              className="h-full"
            />
          </div>
        )}
      </div>

      <footer className="border-border max-h-[250px] shrink-0 overflow-auto border-t p-3">
        <CommitMessageForm onCommit={handleFormCommit} />
      </footer>
    </aside>
  );
};

UncommittedView.displayName = 'UncommittedView';

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

  const [viewMode, setViewMode] = useState<'files' | 'diff'>('files');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const handleSelectFile = (path: string): void => {
    setSelectedFile(path);
    setViewMode('diff');
  };

  const handleViewFullDiff = (): void => {
    setSelectedFile(null);
    setViewMode('diff');
  };

  const handleSwitchToFiles = (): void => {
    setViewMode('files');
  };

  return (
    <aside
      className={cn(
        'bg-surface border-border flex h-full w-full min-w-0 flex-col overflow-hidden border-l',
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

      <div className="flex min-h-0 flex-1 flex-col">
        {viewMode === 'diff' ? (
          <div className="flex h-full flex-col">
            <div className="border-border bg-card/60 flex items-center justify-between gap-2 border-b px-3 py-1.5 text-xs">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleSwitchToFiles}
                leftIcon={<ArrowLeft aria-hidden="true" className="size-3.5" />}
                className="h-7 text-xs"
              >
                Back to files
              </Button>
              <span className="text-foreground max-w-[200px] truncate font-mono text-[11px]">
                {selectedFile ?? 'Full commit diff'}
              </span>
              {selectedFile ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleViewFullDiff}
                  className="text-muted-foreground hover:text-foreground h-7 text-xs"
                >
                  Full diff
                </Button>
              ) : null}
            </div>
            <div className="min-h-0 flex-1">
              {repoPath ? (
                <DiffViewer
                  repoPath={repoPath}
                  range={`${commit.hash}^!`}
                  file={selectedFile ?? undefined}
                  className="h-full"
                />
              ) : null}
            </div>
          </div>
        ) : (
          <div className="flex h-full flex-col">
            {files.length > 0 ? (
              <div className="border-border flex items-center justify-between border-b px-4 py-2 text-xs">
                <span className="text-muted-foreground">
                  Changed files ({files.length})
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={handleViewFullDiff}
                  className="h-6 px-2 text-xs"
                >
                  View commit diff
                </Button>
              </div>
            ) : null}
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
                  <CommitFilesList
                    changes={files}
                    selectedFile={selectedFile}
                    onSelectFile={handleSelectFile}
                  />
                )}
              </ScrollAreaViewport>
            </ScrollAreaRoot>
          </div>
        )}
      </div>

      <footer className="border-border flex shrink-0 items-center justify-between gap-2 border-t p-3">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => onCopyHash(commit.hash)}
            leftIcon={<Copy aria-hidden="true" className="size-3.5" />}
          >
            Copy hash
          </Button>
          {viewMode === 'diff' ? (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={handleSwitchToFiles}
            >
              Show files
            </Button>
          ) : files.length > 0 ? (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={handleViewFullDiff}
            >
              Diff
            </Button>
          ) : null}
        </div>
        <CommitActionsMenu
          commitHash={commit.hash}
          onCopyHash={onCopyHash}
          onCreatePatch={onCreatePatch}
          onCherryPick={onCherryPick}
          onRevert={onRevert}
          onResetToHere={onResetToHere}
        />
      </footer>
    </aside>
  );
};

CommitView.displayName = 'CommitView';
