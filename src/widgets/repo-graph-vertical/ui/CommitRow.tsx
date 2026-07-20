import { GitBranch, Tag } from 'lucide-react';
import { memo, type FC } from 'react';

import { CommitHash } from '@/entities/commit';
import { cn } from '@/shared/lib/theme';
import { Badge } from '@/shared/ui/badge';

import type { CommitRowProps } from '../types';
import {
  GRAPH_WIDTH,
  LANE_WIDTH,
  ROW_HEIGHT
} from '../lib/computeLayout';

const NODE_RADIUS = 5;
const NODE_HALO_RADIUS = 9;
const CURVE_RADIUS = 6;

const relativeTime = (timestamp: number): string => {
  const minutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60000));

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);

  if (hours < 24) return `${hours}h ago`;

  return `${Math.floor(hours / 24)}d ago`;
};

const laneCenter = (lane: number): number =>
  GRAPH_WIDTH / 2 + lane * LANE_WIDTH;

const buildPath = (
  fromLane: number,
  toLane: number,
  rowDistance: number
): string => {
  const fromX = laneCenter(fromLane);
  const toX = laneCenter(toLane);
  const fromY = ROW_HEIGHT / 2;
  const toY = fromY + rowDistance * ROW_HEIGHT;

  if (fromX === toX) {
    return `M ${fromX} ${fromY} L ${toX} ${toY}`;
  }

  const direction = toX > fromX ? 1 : -1;
  const turnY = fromY + ROW_HEIGHT / 2 - CURVE_RADIUS;
  const curveY = turnY + CURVE_RADIUS;

  return [
    `M ${fromX} ${fromY}`,
    `L ${fromX} ${turnY}`,
    `Q ${fromX} ${curveY} ${fromX + direction * CURVE_RADIUS} ${curveY}`,
    `L ${toX - direction * CURVE_RADIUS} ${curveY}`,
    `Q ${toX} ${curveY} ${toX} ${curveY + CURVE_RADIUS}`,
    `L ${toX} ${toY}`
  ].join(' ');
};

const CommitRowComponent: FC<CommitRowProps> = ({
  row,
  rowIndex,
  graphWidth,
  selectedHash,
  onSelect
}) => {
  const { commit } = row;
  const isSelected = commit.hash === selectedHash;
  const isActive = row.active;
  const isHighlighted = isSelected || isActive;
  const references = [
    ...(commit.branches ?? []).map((name) => `Branch: ${name}`),
    ...(commit.tags ?? []).map((name) => `Tag: ${name}`)
  ].join(', ');

  return (
    <li style={{ height: ROW_HEIGHT }} className="relative">
      <button
        type="button"
        onClick={() => onSelect(commit.hash)}
        aria-label={`Select commit ${commit.shortHash}: ${commit.subject || 'no subject'}`}
        aria-pressed={isSelected}
        className={cn(
          'group focus-visible:ring-ring relative flex h-full w-full items-center border-l-2 text-left transition-colors focus-visible:ring-2 focus-visible:ring-inset focus-visible:outline-none',
          isHighlighted
            ? 'border-primary'
            : 'border-transparent',
          isSelected
            ? 'bg-surface-elevated'
            : 'hover:bg-surface-elevated/60'
        )}
      >
        <svg
          width={graphWidth}
          height={ROW_HEIGHT}
          viewBox={`0 0 ${graphWidth} ${ROW_HEIGHT}`}
          overflow="visible"
          className="pointer-events-none absolute top-0 left-0 shrink-0 overflow-visible"
          aria-hidden="true"
        >
          {row.parents.map((parent) => {
            const isActiveEdge = parent.active;
            return (
              <path
                key={`${commit.hash}-${parent.hash}`}
                d={buildPath(
                  row.lane,
                  parent.lane,
                  parent.rowIndex - rowIndex
                )}
                className={cn(
                  'fill-none transition-[stroke,opacity]',
                  isActiveEdge
                    ? 'stroke-primary'
                    : isSelected
                      ? 'stroke-primary/70'
                      : 'stroke-muted-foreground/50'
                )}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            );
          })}
          {isSelected ? (
            <circle
              cx={laneCenter(row.lane)}
              cy={ROW_HEIGHT / 2}
              r={NODE_HALO_RADIUS}
              className="fill-none stroke-primary/40"
              strokeWidth={1}
            />
          ) : null}
          <circle
            cx={laneCenter(row.lane)}
            cy={ROW_HEIGHT / 2}
            r={NODE_RADIUS}
            className={cn(
              'stroke-surface origin-center [transform-box:fill-box] transition-transform duration-fast ease-out group-hover:scale-[1.25]',
              isActive
                ? 'fill-primary'
                : isSelected
                  ? 'fill-ring'
                  : 'fill-muted-foreground group-hover:fill-primary'
            )}
            strokeWidth={2}
          />
        </svg>

        <span
          className="shrink-0"
          style={{ width: graphWidth }}
          aria-hidden="true"
        />

        <span className="flex h-full min-w-0 flex-1 flex-col justify-center gap-0.5 pr-3 pl-2">
          <span className="flex min-w-0 items-center gap-2">
            <CommitHash
              hash={commit.hash}
              className="text-muted-foreground shrink-0 leading-none"
            />
            <span className="text-foreground min-w-12 flex-1 truncate text-sm font-medium">
              {commit.subject || '(no subject)'}
            </span>
            {references ? (
              <span
                className="flex max-w-[50%] min-w-0 shrink gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                title={references}
              >
                {(commit.branches ?? []).map((branch) => (
                  <Badge
                    key={`branch-${branch}`}
                    variant="outline"
                    size="sm"
                    className="border-primary/40 text-primary h-6 max-w-32 shrink-0 gap-1 px-1.5"
                    title={`Branch: ${branch}`}
                  >
                    <GitBranch aria-hidden="true" className="size-3 shrink-0" />
                    <span className="truncate">{branch}</span>
                  </Badge>
                ))}
                {(commit.tags ?? []).map((tag) => (
                  <Badge
                    key={`tag-${tag}`}
                    variant="outline"
                    size="sm"
                    className="h-6 max-w-32 shrink-0 gap-1 px-1.5"
                    title={`Tag: ${tag}`}
                  >
                    <Tag aria-hidden="true" className="size-3 shrink-0" />
                    <span className="truncate">{tag}</span>
                  </Badge>
                ))}
              </span>
            ) : null}
          </span>
          <span className="text-muted-foreground hidden items-center gap-1.5 truncate text-xs sm:flex">
            <span className="truncate">{commit.author}</span>
            <span aria-hidden="true">·</span>
            <time dateTime={new Date(commit.timestamp).toISOString()}>
              {relativeTime(commit.timestamp)}
            </time>
          </span>
        </span>
      </button>
    </li>
  );
};

export const CommitRow = memo(CommitRowComponent);
CommitRow.displayName = 'CommitRow';
