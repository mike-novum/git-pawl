import { GitBranch, Plus, Search } from 'lucide-react';
import type { FC } from 'react';

import { Input } from '@/shared/ui/input';

import type { WorkspaceToolbarProps } from '../types';

export const WorkspaceToolbar: FC<WorkspaceToolbarProps> = ({
  query,
  onQueryChange,
  grouped,
  onGroupedChange,
  onAddRepo,
  onClone
}) => (
  <div className="sticky top-0 z-10 flex items-center gap-2 px-1 py-2">
    <div className="relative max-w-xs flex-1">
      <Search
        aria-hidden="true"
        className="text-muted-foreground absolute left-2.5 top-1/2 size-4 -translate-y-1/2"
      />
      <Input
        type="search"
        placeholder="Search..."
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        className="pl-8"
      />
    </div>
    <button
      type="button"
      onClick={() => onGroupedChange(!grouped)}
      aria-label="Toggle grouping"
      className="text-muted-foreground hover:bg-surface-elevated hover:text-foreground flex h-8 items-center gap-1.5 rounded-md px-3 text-xs transition-colors"
    >
      <GitBranch aria-hidden="true" className="size-3.5" />
      {grouped ? 'Group by folder' : 'Flat list'}
    </button>
    <div className="flex-1" />
    <button
      type="button"
      onClick={onAddRepo}
      className="text-foreground hover:bg-surface-elevated flex h-8 items-center gap-1.5 rounded-md px-3 text-xs transition-colors"
    >
      <Plus aria-hidden="true" className="size-3.5" />
      Add repo
    </button>
    <button
      type="button"
      onClick={onClone}
      className="bg-primary text-primary-foreground hover:shadow-glow flex h-8 items-center gap-1.5 rounded-md px-3 text-xs transition-all"
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
);

WorkspaceToolbar.displayName = 'WorkspaceToolbar';
