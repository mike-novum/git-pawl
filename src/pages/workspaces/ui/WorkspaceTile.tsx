import { Folder, FolderOpen } from 'lucide-react';
import type { FC } from 'react';

import { formatBytes } from '@/entities/workspace';
import { StatusDot } from '@/shared/ui';
import { cn } from '@/shared/lib/theme';

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
        <div className="bg-surface-elevated text-primary flex size-10 items-center justify-center rounded-lg">
          <Folder aria-hidden="true" className="size-5" />
        </div>
        <StatusDot
          variant={status === 'unknown' ? 'clean' : status}
          label={`workspace ${status}`}
        />
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-foreground truncate text-base font-medium">
          {workspace.name}
        </h3>
        <div className="text-muted-foreground flex items-center gap-2 text-xs">
          <span>
            {repoCount} {repoCount === 1 ? 'repo' : 'repos'}
          </span>
          <span aria-hidden="true">·</span>
          <span>{relativeTime(lastActivity)}</span>
        </div>
      </div>
      <div className="flex items-center justify-between">
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
