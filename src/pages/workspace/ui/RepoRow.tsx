import { ArrowDown, ArrowUp, ChevronRight, GitBranch } from 'lucide-react';
import type { FC, KeyboardEvent, MouseEvent } from 'react';

import { useBranches, useCurrentBranch } from '@/entities/branch';
import { useFileChanges } from '@/entities/file-change';
import { RepositoryIcon } from '@/entities/repository';
import { formatBytes } from '@/entities/workspace';
import { OpenInFinder } from '@/features/open-in-finder';
import { OpenInTerminal } from '@/features/open-in-terminal';
import { cn } from '@/shared/lib/theme';
import { StatusDot } from '@/shared/ui';

import type { RepoRowProps } from '../types';

export const RepoRow: FC<RepoRowProps> = ({ repo, sizeBytes, onClick }) => {
  const { data: currentBranchData } = useCurrentBranch(repo.path);
  const { data: branches } = useBranches(repo.path);
  const { data: fileChanges } = useFileChanges(repo.path);

  const branchName = currentBranchData?.name ?? repo.currentBranch;
  const activeBranch = branches?.find(
    (b) => b.current || (branchName ? b.name === branchName : false)
  );
  const ahead = activeBranch?.upstream?.ahead ?? 0;
  const behind = activeBranch?.upstream?.behind ?? 0;

  const changesCount = fileChanges?.length ?? (repo.status === 'dirty' ? 1 : 0);
  const isDirty = repo.status === 'dirty' || (fileChanges ? fileChanges.length > 0 : false);
  const isClean = !isDirty && repo.status === 'clean';

  const displayBytes = sizeBytes ?? repo.sizeBytes ?? null;

  const handleClick = (): void => {
    onClick();
  };

  const handleKeyDown = (e: KeyboardEvent): void => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  const handleActionsClick = (e: MouseEvent): void => {
    e.stopPropagation();
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        'bg-surface border-border hover:border-primary/50 hover:bg-surface-elevated/40 group flex items-center justify-between gap-4 rounded-lg border px-3.5 py-2.5 text-left transition-all',
        'duration-(--duration-base) ease-(--ease-fast) cursor-pointer select-none'
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <RepositoryIcon iconPath={repo.iconPath} name={repo.name} size="sm" />
        <span className="text-foreground group-hover:text-primary max-w-[200px] truncate text-sm font-medium transition-colors">
          {repo.name}
        </span>

        {branchName ? (
          <span className="bg-surface-elevated text-muted-foreground inline-flex max-w-[160px] items-center gap-1 rounded border border-border/50 px-2 py-0.5 font-mono text-xs">
            <GitBranch aria-hidden="true" className="text-primary size-3 shrink-0" />
            <span className="truncate">{branchName}</span>
          </span>
        ) : null}

        {ahead > 0 || behind > 0 ? (
          <span className="bg-surface-elevated inline-flex items-center gap-1.5 rounded border border-border/50 px-1.5 py-0.5 font-mono text-xs">
            {ahead > 0 ? (
              <span className="inline-flex items-center text-emerald-500 font-medium">
                <ArrowUp aria-hidden="true" className="size-3" />
                {ahead}
              </span>
            ) : null}
            {behind > 0 ? (
              <span className="inline-flex items-center text-sky-500 font-medium">
                <ArrowDown aria-hidden="true" className="size-3" />
                {behind}
              </span>
            ) : null}
          </span>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center gap-3">
        {isDirty ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-500">
            <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
            {changesCount} {changesCount === 1 ? 'change' : 'changes'}
          </span>
        ) : isClean ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-500">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            Clean
          </span>
        ) : (
          <StatusDot variant="danger" label="repository unknown" />
        )}

        <span className="text-muted-foreground w-16 text-right font-mono text-xs">
          {displayBytes !== null ? formatBytes(displayBytes) : '—'}
        </span>

        <div
          onClick={handleActionsClick}
          className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-(--duration-fast)"
        >
          <OpenInFinder
            path={repo.path}
            className="text-muted-foreground hover:bg-surface-elevated hover:text-foreground flex size-7 items-center justify-center rounded-md transition-colors"
          />
          <OpenInTerminal
            path={repo.path}
            className="text-muted-foreground hover:bg-surface-elevated hover:text-foreground flex size-7 items-center justify-center rounded-md transition-colors"
          />
        </div>

        <ChevronRight
          aria-hidden="true"
          className="text-muted-foreground group-hover:text-primary size-4 transition-colors"
        />
      </div>
    </div>
  );
};

RepoRow.displayName = 'RepoRow';
