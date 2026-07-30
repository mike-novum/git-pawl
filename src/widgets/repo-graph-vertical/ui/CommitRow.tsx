import { GitBranch, Tag } from 'lucide-react';
import { memo, type FC } from 'react';

import { CommitHash } from '@/entities/commit';
import { cn } from '@/shared/lib/theme';
import { Badge } from '@/shared/ui/badge';

import type { CommitRowProps } from '../types';
import { buildPath } from '../lib/buildPath';
import { GRAPH_WIDTH, LANE_WIDTH, ROW_HEIGHT } from '../lib/computeLayout';

const NODE_RADIUS = 5;
const NODE_HALO_RADIUS = 9;

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

const CommitRowComponent: FC<CommitRowProps> = ({
  row,
  graphWidth,
  selectedHash,
  onSelect
}) => {
  const { commit } = row;
  const isSelected = commit.hash === selectedHash;
  const references = [
    ...(commit.branches ?? []).map((name) => `Branch: ${name}`),
    ...(commit.tags ?? []).map((name) => `Tag: ${name}`)
  ].join(', ');
  const rowLines = row.verticalLines;

  return (
    <tr
      aria-selected={isSelected}
      aria-label={`Select commit ${commit.shortHash}: ${commit.subject || 'no subject'}`}
      tabIndex={0}
      onClick={() => onSelect(commit.hash)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelect(commit.hash);
        }
      }}
      className={cn(
        'group h-8 cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-inset focus-visible:outline-none',
        isSelected ? 'bg-surface-elevated' : 'hover:bg-surface-elevated/60'
      )}
    >
      <td
        className="relative p-0 align-middle"
        style={{ width: graphWidth }}
      >
        <svg
          width={graphWidth}
          height={ROW_HEIGHT}
          viewBox={`0 0 ${graphWidth} ${ROW_HEIGHT}`}
          className="pointer-events-none absolute top-0 left-0"
          aria-hidden="true"
        >
          {rowLines.map((line, lineIndex) => (
            <path
              key={`${commit.hash}-line-${lineIndex}`}
              d={buildPath(line)}
              fill="none"
              stroke={line.color}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
          {isSelected ? (
            <circle
              cx={laneCenter(row.lane)}
              cy={ROW_HEIGHT / 2}
              r={NODE_HALO_RADIUS}
              fill="none"
              stroke="var(--color-primary)"
              strokeOpacity={0.4}
              strokeWidth={1}
            />
          ) : null}
          <circle
            cx={laneCenter(row.lane)}
            cy={ROW_HEIGHT / 2}
            r={NODE_RADIUS}
            fill={commit.color ?? 'var(--color-graph-lane-1)'}
            stroke="var(--color-surface)"
            strokeWidth={2}
            className="origin-center transition-transform duration-fast ease-out group-hover:scale-[1.25]"
          />
        </svg>
      </td>
      <td className="max-w-0 min-w-0 p-0 px-2 align-middle">
        <span className="flex min-w-0 items-center gap-2 truncate">
          {commit.branches?.map((branch) => (
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
          {commit.tags?.map((tag) => (
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
          <span
            className="text-foreground min-w-0 flex-1 truncate text-sm font-medium"
            title={references ? `${references}: ${commit.subject}` : commit.subject}
          >
            {commit.subject || '(no subject)'}
          </span>
        </span>
      </td>
      <td className="text-muted-foreground whitespace-nowrap p-0 px-2 font-mono text-xs align-middle">
        <CommitHash hash={commit.hash} />
      </td>
      <td
        className="text-muted-foreground hidden max-w-0 min-w-0 truncate p-0 px-2 text-xs align-middle sm:table-cell"
        title={commit.authorEmail ? `${commit.author} <${commit.authorEmail}>` : commit.author}
      >
        <span className="truncate">
          {commit.author}
          {commit.authorEmail ? ` <${commit.authorEmail}>` : ''}
        </span>
      </td>
      <td className="text-muted-foreground hidden whitespace-nowrap p-0 px-2 text-xs align-middle sm:table-cell">
        <time dateTime={new Date(commit.timestamp).toISOString()}>
          {relativeTime(commit.timestamp)}
        </time>
      </td>
    </tr>
  );
};

export const CommitRow = memo(CommitRowComponent);
CommitRow.displayName = 'CommitRow';
