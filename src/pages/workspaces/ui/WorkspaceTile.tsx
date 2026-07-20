import { FolderOpen } from 'lucide-react';
import type { FC } from 'react';

import { formatBytes, WorkspaceIcon } from '@/entities/workspace';
import { cn } from '@/shared/lib';
import { StatusDot } from '@/shared/ui';

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
  onOpen
}) => {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        'bg-surface border-border hover:border-primary hover:shadow-glow group flex h-44 w-full flex-col justify-between rounded-xl border p-4 text-left transition-all',
        'duration-(--duration-base) ease-(--ease-fast)'
      )}
    >
      <div className="flex items-start justify-between">
        <WorkspaceIcon
          workspace={workspace}
          iconPath={iconPath}
          size="md"
        />
        {status !== 'unknown' ? (
          <StatusDot variant={status} label={`workspace ${status}`} />
        ) : null}
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-foreground truncate text-base font-medium">
          {workspace.name}
        </h3>
        <div className="text-muted-foreground flex items-center gap-2 text-xs">
          <span>
            {repoCount} {repoCount === 1 ? 'repo' : 'repos'}
          </span>
          {lastActivity !== null ? (
            <>
              <span aria-hidden="true">·</span>
              <span>{relativeTime(lastActivity)}</span>
            </>
          ) : null}
        </div>
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-muted-foreground font-mono text-xs">
          {sizeBytes !== null ? formatBytes(sizeBytes) : '—'}
        </span>
        <FolderOpen
          aria-hidden="true"
          className="text-muted-foreground group-hover:text-primary size-4 transition-colors"
        />
      </div>
    </button>
  );
};

WorkspaceTile.displayName = 'WorkspaceTile';