import { GitBranch } from 'lucide-react';
import type { FC } from 'react';

import { formatBytes } from '@/entities/workspace';
import type { Repository } from '@/entities/repository';
import { StatusDot } from '@/shared/ui';
import { cn } from '@/shared/lib/theme';

import type { RepoCardProps } from '../types';

const statusToVariant = (status: Repository['status']): 'clean' | 'warning' | 'danger' => {
  if (status === 'dirty') return 'warning';
  if (status === 'unknown') return 'danger';
  return 'clean';
};

const relativeTime = (ts: number | null): string => {
  if (!ts) return '—';
  const diff = Date.now() - ts;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${Math.max(minutes, 1)}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(ts).toLocaleDateString();
};

export const RepoCard: FC<RepoCardProps> = ({ repo, sizeBytes, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'bg-surface border-border hover:border-primary hover:shadow-glow group flex h-32 w-full flex-col justify-between rounded-lg border p-3 text-left transition-all',
      'duration-(--duration-base) ease-(--ease-fast)'
    )}
  >
    <div className="flex items-start justify-between gap-2">
      <span className="text-foreground truncate text-sm font-medium">{repo.name}</span>
      <StatusDot
        variant={statusToVariant(repo.status)}
        label={`repository ${repo.status}`}
      />
    </div>
    <div className="flex flex-col gap-1">
      {repo.currentBranch ? (
        <span className="bg-surface-elevated text-muted-foreground inline-flex w-fit items-center gap-1 rounded px-1.5 py-0.5 font-mono text-xs">
          <GitBranch aria-hidden="true" className="size-3" />
          {repo.currentBranch}
        </span>
      ) : null}
      <div className="text-muted-foreground flex items-center justify-between text-xs">
        <span>{relativeTime(null)}</span>
        <span className="font-mono">{sizeBytes !== null ? formatBytes(sizeBytes) : '—'}</span>
      </div>
    </div>
  </button>
);

RepoCard.displayName = 'RepoCard';
