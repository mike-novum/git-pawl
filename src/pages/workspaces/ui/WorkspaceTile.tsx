import { FolderOpen } from 'lucide-react';
import type { FC, KeyboardEvent, MouseEvent } from 'react';

import { formatBytes, WorkspaceIcon } from '@/entities/workspace';
import { OpenInFinder } from '@/features/open-in-finder';
import { cn } from '@/shared/lib';
import { Skeleton, StatusDot } from '@/shared/ui';

import type { WorkspaceTileProps } from '../types';

const relativeTime = (ts: number | null): string => {
  if (!ts) return '—';
  const diff = Date.now() - ts;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(ts).toLocaleDateString();
};

export const WorkspaceTile: FC<WorkspaceTileProps> = ({
  workspace,
  iconPath,
  repoCount,
  sizeBytes,
  status,
  lastActivity,
  isLoading = false,
  onOpen
}) => {
  const handleClick = (): void => {
    onOpen();
  };

  const handleKeyDown = (e: KeyboardEvent): void => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onOpen();
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
        'bg-surface border-border hover:border-primary/50 hover:shadow-glow group flex h-44 w-full flex-col justify-between rounded-xl border p-4 text-left transition-all',
        'duration-(--duration-base) ease-(--ease-fast) cursor-pointer select-none'
      )}
    >
      <div className="flex items-start justify-between">
        <WorkspaceIcon
          workspace={workspace}
          iconPath={iconPath}
          size="md"
        />
        <div className="flex items-center gap-1.5">
          <div
            onClick={handleActionsClick}
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-(--duration-fast)"
          >
            <OpenInFinder
              path={workspace.path}
              className="text-muted-foreground hover:bg-surface-elevated hover:text-foreground flex size-7 items-center justify-center rounded-md transition-colors"
            />
          </div>
          {isLoading ? (
            <Skeleton className="size-2.5 rounded-full" aria-hidden="true" />
          ) : status !== 'unknown' ? (
            <StatusDot variant={status} label={`workspace ${status}`} />
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-0.5">
        <h3 className="text-foreground group-hover:text-primary truncate text-base font-semibold transition-colors">
          {workspace.name}
        </h3>
        <p className="text-muted-foreground truncate font-mono text-[11px] opacity-70">
          {workspace.path}
        </p>
        <div className="text-muted-foreground flex items-center gap-2 text-xs pt-1">
          {repoCount === null ? (
            <Skeleton className="h-3 w-12" aria-hidden="true" />
          ) : (
            <span>
              {repoCount} {repoCount === 1 ? 'repo' : 'repos'}
            </span>
          )}
          {lastActivity !== null ? (
            <>
              <span aria-hidden="true">·</span>
              <span>{relativeTime(lastActivity)}</span>
            </>
          ) : null}
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-border/40 pt-2">
        <span className="text-muted-foreground font-mono text-xs">
          {isLoading ? (
            <Skeleton className="h-3 w-14" aria-hidden="true" />
          ) : (
            formatBytes(sizeBytes ?? 0)
          )}
        </span>
        <FolderOpen
          aria-hidden="true"
          className="text-muted-foreground group-hover:text-primary size-4 transition-colors"
        />
      </div>
    </div>
  );
};

WorkspaceTile.displayName = 'WorkspaceTile';
