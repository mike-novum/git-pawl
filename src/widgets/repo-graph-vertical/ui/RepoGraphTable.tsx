import {
  useEffect,
  useState,
  type FC,
  type KeyboardEvent,
  type MouseEvent
} from 'react';

import { cn } from '@/shared/lib/theme';

import type {
  ColumnKey,
  ColumnWidths,
  RepoGraphTableProps
} from '../types';
import { CommitRow } from './CommitRow';
import { GraphLayer } from './GraphLayer';

const COLUMN_STORAGE_KEY = 'commit-graph-columns';

const COLUMN_KEYS: ColumnKey[] = [
  'graph',
  'description',
  'commit',
  'author',
  'date'
];

const COLUMN_LABELS: Record<ColumnKey, string> = {
  graph: 'Graph',
  description: 'Description',
  commit: 'Commit',
  author: 'Author',
  date: 'Date'
};

const DEFAULT_COLUMN_WIDTHS: ColumnWidths = {
  graph: 120,
  description: null,
  commit: 90,
  author: 140,
  date: 130
};

const MIN_COLUMN_WIDTHS: Record<ColumnKey, number> = {
  graph: 80,
  description: 400,
  commit: 76,
  author: 100,
  date: 100
};

const GRAPH_COLUMN_PADDING = 16;

type ResizeState = {
  key: ColumnKey;
  startX: number;
  startWidth: number;
};

const isColumnKey = (value: string): value is ColumnKey =>
  COLUMN_KEYS.includes(value as ColumnKey);

const readColumnWidths = (): ColumnWidths => {
  if (typeof window === 'undefined') {
    return DEFAULT_COLUMN_WIDTHS;
  }

  try {
    const stored = window.localStorage.getItem(COLUMN_STORAGE_KEY);
    if (!stored) {
      return DEFAULT_COLUMN_WIDTHS;
    }

    const parsed: unknown = JSON.parse(stored);
    if (!parsed || typeof parsed !== 'object') {
      return DEFAULT_COLUMN_WIDTHS;
    }

    const widths = { ...DEFAULT_COLUMN_WIDTHS };
    Object.entries(parsed).forEach(([key, value]) => {
      if (
        isColumnKey(key) &&
        (typeof value === 'number' || value === null) &&
        (value === null || value >= MIN_COLUMN_WIDTHS[key])
      ) {
        widths[key] = value;
      }
    });

    return widths;
  } catch {
    return DEFAULT_COLUMN_WIDTHS;
  }
};

export const RepoGraphTable: FC<RepoGraphTableProps> = ({
  layout,
  selectedHash,
  onSelect,
  className
}) => {
  const [columnWidths, setColumnWidths] = useState<ColumnWidths>(readColumnWidths);
  const [resizeState, setResizeState] = useState<ResizeState | null>(null);
  const [hoveredRowIndex, setHoveredRowIndex] = useState<number | null>(null);

  const handleRowMouseEnter = (rowIndex: number): void => {
    setHoveredRowIndex(rowIndex);
  };

  const handleRowMouseLeave = (): void => {
    setHoveredRowIndex(null);
  };

  useEffect(() => {
    window.localStorage.setItem(COLUMN_STORAGE_KEY, JSON.stringify(columnWidths));
  }, [columnWidths]);

  useEffect(() => {
    if (!resizeState) {
      return undefined;
    }

    const handleMouseMove = (event: globalThis.MouseEvent): void => {
      setColumnWidths((current) => {
        const width = Math.max(
          MIN_COLUMN_WIDTHS[resizeState.key],
          resizeState.startWidth + event.clientX - resizeState.startX
        );

        return { ...current, [resizeState.key]: width };
      });
    };

    const handleMouseUp = (): void => {
      setResizeState(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizeState]);

  const handleResizeStart = (
    event: MouseEvent<HTMLDivElement>,
    key: ColumnKey
  ): void => {
    event.preventDefault();
    event.stopPropagation();
    setResizeState({
      key,
      startX: event.clientX,
      startWidth: columnWidths[key] ?? MIN_COLUMN_WIDTHS[key]
    });
  };

  const handleResizeKeyDown = (
    event: KeyboardEvent<HTMLDivElement>,
    key: ColumnKey
  ): void => {
    const step = event.shiftKey ? 24 : 8;
    const direction =
      event.key === 'ArrowLeft' || event.key === 'ArrowUp'
        ? -1
        : event.key === 'ArrowRight' || event.key === 'ArrowDown'
          ? 1
          : 0;

    if (direction === 0) {
      return;
    }

    event.preventDefault();
    setColumnWidths((current) => {
      const currentWidth = current[key] ?? MIN_COLUMN_WIDTHS[key];
      const nextWidth = Math.max(
        MIN_COLUMN_WIDTHS[key],
        currentWidth + direction * step
      );
      return { ...current, [key]: nextWidth };
    });
  };

  const requiredGraphWidth = layout.width + GRAPH_COLUMN_PADDING;
  const graphWidth = Math.max(
    MIN_COLUMN_WIDTHS.graph,
    columnWidths.graph ?? requiredGraphWidth
  );
  const graphOverlay = (
    <GraphLayer
      layout={{ ...layout, width: graphWidth }}
      selectedHash={selectedHash}
      hoveredRowIndex={hoveredRowIndex}
    />
  );

  return (
    <div className={cn('min-w-0 overflow-auto', className)}>
      <table className="w-full min-w-[880px] table-fixed border-collapse text-left">
        <caption className="sr-only">Commit graph</caption>
        <colgroup>
          {COLUMN_KEYS.map((key) => (
            <col
              key={key}
              style={
                columnWidths[key] === null
                  ? undefined
                  : { width: `${columnWidths[key]}px` }
              }
            />
          ))}
        </colgroup>
        <thead className="bg-surface sticky top-0 z-10">
          <tr className="border-border border-b">
            {COLUMN_KEYS.map((key) => (
              <th
                key={key}
                scope="col"
                className={cn(
                  'text-muted-foreground relative h-8 px-2 text-xs font-medium',
                  (key === 'author' || key === 'date') && 'hidden sm:table-cell'
                )}
                style={{ minWidth: MIN_COLUMN_WIDTHS[key] }}
              >
                {COLUMN_LABELS[key]}
                {key !== 'date' ? (
                  <div
                    role="separator"
                    aria-orientation="vertical"
                    tabIndex={0}
                    aria-label={`Resize ${COLUMN_LABELS[key]} column`}
                    aria-valuenow={columnWidths[key] ?? MIN_COLUMN_WIDTHS[key]}
                    aria-valuemin={MIN_COLUMN_WIDTHS[key]}
                    aria-valuemax={2000}
                    onMouseDown={(event) => handleResizeStart(event, key)}
                    onKeyDown={(event) => handleResizeKeyDown(event, key)}
                    className="bg-border/60 hover:bg-primary focus:bg-primary absolute top-0 right-0 h-full w-px cursor-col-resize transition-colors focus:outline-none focus-visible:w-[3px]"
                  />
                ) : null}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-border/20 divide-y">
          {layout.rows.map((row, rowIndex) => (
            <CommitRow
              key={row.commit.hash}
              row={row}
              rowIndex={rowIndex}
              graphWidth={graphWidth}
              selectedHash={selectedHash}
              onSelect={onSelect}
              branchTips={layout.branchTips}
              graphOverlay={rowIndex === 0 ? graphOverlay : undefined}
              onMouseEnter={() => handleRowMouseEnter(rowIndex)}
              onMouseLeave={handleRowMouseLeave}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

RepoGraphTable.displayName = 'RepoGraphTable';
