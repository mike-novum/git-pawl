import type { FC } from 'react';

import { cn } from '@/shared/lib/theme';

import type { CommitNode, RepoGraphProps } from '../types';

const NODE_R = 4;
const LANE_WIDTH = 14;
const GRAPH_WIDTH = 32;

const relativeTime = (ts: number): string => {
  const diff = Date.now() - ts;
  const h = Math.floor(diff / 3600000);
  if (h < 1) return 'just now';
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
};

export const RepoGraph: FC<RepoGraphProps> = ({
  commits,
  selectedHash,
  onSelect,
  className
}) => {
  const ordered: CommitNode[] = [...commits].sort((a, b) => b.timestamp - a.timestamp);
  const maxLane = ordered.reduce((m, c) => Math.max(m, c.lane), 0);

  return (
    <div className={cn('bg-surface flex h-full flex-col overflow-auto', className)}>
      {ordered.map((commit) => {
        const x = GRAPH_WIDTH / 2 + commit.lane * LANE_WIDTH;
        const isSelected = commit.hash === selectedHash;
        return (
          <button
            type="button"
            key={commit.hash}
            onClick={() => onSelect(commit.hash)}
            className={cn(
              'hover:bg-surface-elevated flex items-center gap-3 border-b border-border/40 px-3 py-2 text-left transition-colors',
              isSelected && 'bg-surface-elevated'
            )}
          >
            <svg
              width={GRAPH_WIDTH + maxLane * LANE_WIDTH}
              height="32"
              className="shrink-0"
              aria-hidden="true"
            >
              <line
                x1={x}
                y1={0}
                x2={x}
                y2={32}
                stroke="currentColor"
                strokeOpacity="0.25"
                strokeWidth="1"
              />
              <circle
                cx={x}
                cy={16}
                r={NODE_R}
                fill={
                  isSelected ? 'var(--color-primary)' : 'var(--color-muted-foreground)'
                }
              />
            </svg>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <div className="flex items-baseline gap-2">
                <span className="text-muted-foreground font-mono text-xs">
                  {commit.shortHash}
                </span>
                <span className="text-foreground truncate text-sm">{commit.subject}</span>
              </div>
              <div className="text-muted-foreground flex items-center gap-2 text-xs">
                <span>{commit.author}</span>
                <span aria-hidden="true">·</span>
                <span>{relativeTime(commit.timestamp)}</span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

RepoGraph.displayName = 'RepoGraph';
