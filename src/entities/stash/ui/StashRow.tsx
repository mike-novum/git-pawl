import { Archive } from 'lucide-react';
import type { FC } from 'react';

import { cn } from '@/shared/lib/theme';

import type { StashRowProps } from './types';

export const StashRow: FC<StashRowProps> = ({ entry, className }) => (
  <div
    className={cn(
      'flex items-center gap-2 rounded-md border border-border/60 bg-card px-3 py-2 text-sm',
      className
    )}
    title={`${entry.ref} on ${entry.branch}`}
  >
    <Archive className="text-muted-foreground h-4 w-4 shrink-0" aria-hidden="true" />
    <span className="text-muted-foreground shrink-0 font-mono text-xs">{entry.ref}</span>
    <span className="min-w-0 flex-1 truncate">{entry.message}</span>
    <span className="text-muted-foreground shrink-0 text-xs">{entry.branch}</span>
  </div>
);
