import { FolderTree, LayoutGrid, List, Plus, Search, X } from 'lucide-react';
import type { ChangeEvent, FC } from 'react';

import { OpenInAgent } from '@/features/open-in-agent';
import { OpenInFinder } from '@/features/open-in-finder';
import { OpenInTerminal } from '@/features/open-in-terminal';
import { cn } from '@/shared/lib/theme';
import { Input } from '@/shared/ui/input';

import type { WorkspaceToolbarProps } from '../types';

export const WorkspaceToolbar: FC<WorkspaceToolbarProps> = ({
  path,
  query,
  onQueryChange,
  grouped,
  onGroupedChange,
  viewMode = 'grid',
  onViewModeChange,
  onAddRepo,
  onClone,
  totalReposCount,
  filteredReposCount
}) => {
  const handleQueryChange = (e: ChangeEvent<HTMLInputElement>): void => {
    onQueryChange(e.target.value);
  };

  const handleClearQuery = (): void => {
    onQueryChange('');
  };

  const handleToggleGrouped = (): void => {
    onGroupedChange(!grouped);
  };

  const handleSetGrid = (): void => {
    onViewModeChange?.('grid');
  };

  const handleSetList = (): void => {
    onViewModeChange?.('list');
  };

  const isFiltering = query.trim().length > 0;

  return (
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-xs flex flex-wrap items-center gap-2.5 py-2">
      <div className="relative flex min-w-[200px] max-w-xs flex-1 items-center">
        <Search
          aria-hidden="true"
          className="text-muted-foreground absolute left-2.5 top-1/2 size-4 -translate-y-1/2"
        />
        <Input
          type="text"
          placeholder="Search repositories..."
          value={query}
          onChange={handleQueryChange}
          className="pl-8 pr-8 h-8 text-xs"
        />
        {isFiltering ? (
          <button
            type="button"
            onClick={handleClearQuery}
            aria-label="Clear search"
            className="text-muted-foreground hover:text-foreground absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded transition-colors"
          >
            <X aria-hidden="true" className="size-3.5" />
          </button>
        ) : null}
      </div>

      {isFiltering && filteredReposCount !== undefined ? (
        <span className="text-muted-foreground bg-surface-elevated border-border rounded-md px-2 py-1 text-xs font-medium border whitespace-nowrap">
          {filteredReposCount} of {totalReposCount ?? filteredReposCount}
        </span>
      ) : null}

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={handleToggleGrouped}
          aria-label="Toggle folder grouping"
          title={grouped ? 'Grouped by folder' : 'Flat list'}
          className={cn(
            'flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs transition-colors border',
            grouped
              ? 'bg-surface-elevated border-border text-foreground font-medium'
              : 'border-transparent text-muted-foreground hover:bg-surface-elevated hover:text-foreground'
          )}
        >
          <FolderTree
            aria-hidden="true"
            className={cn('size-3.5', grouped ? 'text-primary' : 'text-muted-foreground')}
          />
          <span>{grouped ? 'Grouped' : 'Flat'}</span>
        </button>

        <div className="bg-surface-elevated border-border flex items-center rounded-md border p-0.5">
          <button
            type="button"
            onClick={handleSetGrid}
            aria-label="Grid view"
            title="Grid view"
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded text-xs transition-colors',
              viewMode === 'grid'
                ? 'bg-surface text-foreground shadow-xs font-medium'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <LayoutGrid aria-hidden="true" className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={handleSetList}
            aria-label="List view"
            title="List view"
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded text-xs transition-colors',
              viewMode === 'list'
                ? 'bg-surface text-foreground shadow-xs font-medium'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <List aria-hidden="true" className="size-3.5" />
          </button>
        </div>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-1 border-r border-border/50 pr-2">
        <OpenInAgent path={path} />
        <OpenInFinder path={path} />
        <OpenInTerminal path={path} />
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onAddRepo}
          className="text-foreground hover:bg-surface-elevated border-border hover:border-primary/50 flex h-8 items-center gap-1.5 rounded-md border px-3 text-xs font-medium transition-colors"
        >
          <Plus aria-hidden="true" className="size-3.5" />
          Add local repo
        </button>
        <button
          type="button"
          onClick={onClone}
          className="bg-primary text-primary-foreground hover:shadow-glow flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-all"
        >
          <svg
            aria-hidden="true"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Clone
        </button>
      </div>
    </div>
  );
};

WorkspaceToolbar.displayName = 'WorkspaceToolbar';
