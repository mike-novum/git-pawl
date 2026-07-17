import { useMemo } from 'react';
import type { FC } from 'react';

import { useCommitGraph } from '@/entities/commit-graph';
import type { CommitGraph as CommitGraphModel } from '@/entities/commit-graph';
import type { Commit } from '@/entities/commit';
import { cn } from '@/shared/lib/theme';
import { Empty } from '@/shared/ui/empty';
import {
  ScrollAreaRoot,
  ScrollAreaViewport
} from '@/shared/ui/scroll-area';
import { Spinner } from '@/shared/ui/spinner';

import type { CommitGraphProps } from './types';

const LANE_WIDTH = 18;
const ROW_HEIGHT = 56;
const DOT_RADIUS = 4;
const PADDING_X = 8;
const PADDING_Y = 8;
const SHORT_HASH_LENGTH = 7;

type RowLayout = {
  hash: string;
  lane: number;
  commit: Commit;
  parents: { hash: string; lane: number; rowIndex: number }[];
};

type GraphLayout = {
  rows: RowLayout[];
  laneCount: number;
  width: number;
  height: number;
};

const computeLayout = (graph: CommitGraphModel): GraphLayout => {
  const orderedCommits = [...graph.nodes.values()]
    .sort((a, b) => {
      if (a.commit.date !== b.commit.date) {
        return a.commit.date - b.commit.date;
      }
      return a.commit.hash.localeCompare(b.commit.hash);
    })
    .map((node) => node.commit);

  const hashToRowIndex = new Map<string, number>();
  const hashToLane = new Map<string, number>();
  const rows: RowLayout[] = [];
  let nextLane = 0;

  for (const commit of orderedCommits) {
    const node = graph.nodes.get(commit.hash);
    if (!node) continue;

    const rowIndex = rows.length;
    hashToRowIndex.set(commit.hash, rowIndex);

    let lane: number;
    if (hashToLane.has(commit.hash)) {
      lane = hashToLane.get(commit.hash) as number;
    } else if (node.parents.length > 0) {
      const firstParent = node.parents[0];
      lane = hashToLane.get(firstParent) ?? nextLane;
      if (!hashToLane.has(firstParent)) {
        hashToLane.set(firstParent, lane);
        if (lane === nextLane) nextLane += 1;
      }
    } else {
      lane = nextLane;
      nextLane += 1;
    }
    hashToLane.set(commit.hash, lane);

    for (let i = 1; i < node.parents.length; i += 1) {
      const parentHash = node.parents[i];
      if (!hashToLane.has(parentHash)) {
        hashToLane.set(parentHash, nextLane);
        nextLane += 1;
      }
    }

    rows.push({
      hash: commit.hash,
      lane,
      commit,
      parents: node.parents.map((parentHash) => ({
        hash: parentHash,
        lane: hashToLane.get(parentHash) ?? 0,
        rowIndex: hashToRowIndex.get(parentHash) ?? -1
      }))
    });
  }

  const width = Math.max(1, nextLane) * LANE_WIDTH + PADDING_X * 2;
  const height = Math.max(1, rows.length) * ROW_HEIGHT + PADDING_Y * 2;

  return { rows, laneCount: Math.max(1, nextLane), width, height };
};

const laneCenterX = (lane: number): number =>
  PADDING_X + lane * LANE_WIDTH + LANE_WIDTH / 2;

const rowCenterY = (rowIndex: number): number =>
  PADDING_Y + rowIndex * ROW_HEIGHT + ROW_HEIGHT / 2;

const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const CommitGraph: FC<CommitGraphProps> = ({
  repoPath,
  onCommitClick,
  className
}) => {
  const { graph, isLoading, isError } = useCommitGraph(repoPath);

  const layout = useMemo<GraphLayout | null>(
    () => (graph ? computeLayout(graph) : null),
    [graph]
  );

  if (!repoPath) {
    return (
      <div className={cn('flex h-full w-full p-4', className)}>
        <Empty
          title="No repository selected"
          description="Select a repository to view its commit graph."
          className="h-full w-full"
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        className={cn(
          'text-muted-foreground flex h-full w-full items-center justify-center gap-2 p-6 text-sm',
          className
        )}
        role="status"
        aria-live="polite"
      >
        <Spinner className="size-4" />
        Loading commit graph...
      </div>
    );
  }

  if (isError) {
    return (
      <div className={cn('flex h-full w-full p-4', className)}>
        <Empty
          title="Failed to load commit graph"
          description="Check the repository path and try again."
          className="h-full w-full"
        />
      </div>
    );
  }

  if (!layout || layout.rows.length === 0) {
    return (
      <div className={cn('flex h-full w-full p-4', className)}>
        <Empty
          title="No commits"
          description="This repository has no commits yet."
          className="h-full w-full"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'border-border bg-card text-card-foreground flex h-full w-full flex-col rounded-md border',
        className
      )}
      aria-label="Commit graph"
    >
      <ScrollAreaRoot className="min-h-0 flex-1">
        <ScrollAreaViewport className="h-full">
          <div className="flex w-full">
            <svg
              width={layout.width}
              height={layout.height}
              viewBox={`0 0 ${layout.width} ${layout.height}`}
              role="presentation"
              className="shrink-0 select-none"
            >
              {layout.rows.flatMap((row, index) =>
                row.parents.map((parent, parentIndex) => {
                  if (parent.rowIndex < 0) return null;
                  const fromX = laneCenterX(row.lane);
                  const fromY = rowCenterY(index);
                  const toX = laneCenterX(parent.lane);
                  const toY = rowCenterY(parent.rowIndex);
                  return (
                    <line
                      key={`${row.hash}-${parent.hash}-${parentIndex}`}
                      x1={fromX}
                      y1={fromY}
                      x2={toX}
                      y2={toY}
                      stroke="currentColor"
                      strokeWidth={1.5}
                      className="text-border"
                      strokeLinecap="round"
                    />
                  );
                })
              )}
              {layout.rows.map((row, index) => (
                <circle
                  key={`dot-${row.hash}`}
                  cx={laneCenterX(row.lane)}
                  cy={rowCenterY(index)}
                  r={DOT_RADIUS}
                  className="fill-primary"
                />
              ))}
            </svg>
            <ul
              className="flex flex-1 flex-col"
              role="list"
              aria-label="Commits"
            >
              {layout.rows.map((row) => {
                const shortHash =
                  row.commit.hash.length > SHORT_HASH_LENGTH
                    ? row.commit.hash.slice(0, SHORT_HASH_LENGTH)
                    : row.commit.hash;
                return (
                  <li
                    key={row.hash}
                    style={{ height: ROW_HEIGHT }}
                    className="border-b border-border/60 last:border-b-0"
                  >
                    <button
                      type="button"
                      onClick={() => onCommitClick?.(row.hash)}
                      className={cn(
                        'flex h-full w-full items-center gap-3 px-3 text-left transition-colors',
                        'hover:bg-muted/60 focus-visible:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                      )}
                      aria-label={`Open commit ${row.commit.hash}`}
                    >
                      <code
                        className="text-muted-foreground shrink-0 rounded bg-muted px-1.5 py-0.5 font-mono text-xs tabular-nums"
                        title={row.commit.hash}
                      >
                        {shortHash}
                      </code>
                      <span className="text-foreground min-w-0 flex-1 truncate text-sm font-medium">
                        {row.commit.subject || '(no subject)'}
                      </span>
                      <span className="text-muted-foreground hidden shrink-0 text-xs sm:inline">
                        {row.commit.author.name}
                      </span>
                      <time
                        dateTime={new Date(row.commit.date).toISOString()}
                        className="text-muted-foreground shrink-0 font-mono text-xs tabular-nums"
                      >
                        {formatDate(row.commit.date)}
                      </time>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </ScrollAreaViewport>
      </ScrollAreaRoot>
    </div>
  );
};

CommitGraph.displayName = 'CommitGraph';
