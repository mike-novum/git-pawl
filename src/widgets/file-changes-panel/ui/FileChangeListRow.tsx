import { Eye, FilePlus2, FileMinus2, FileEdit, FileQuestion, FileSymlink, EyeOff } from 'lucide-react';
import type { FC, KeyboardEvent, ReactNode } from 'react';

import { FILE_CHANGE_STATUS_LABELS } from '@/entities/file-change';
import type { FileChange } from '@/entities/file-change';
import { cn } from '@/shared/lib/theme';

import type { FileChangeListRowProps } from './types';

const STATUS_BADGE_CLASS: Record<FileChange['status'], string> = {
  M: 'bg-amber-500/15 text-amber-600 border-amber-500/30 dark:text-amber-400',
  A: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30 dark:text-emerald-400',
  D: 'bg-rose-500/15 text-rose-600 border-rose-500/30 dark:text-rose-400',
  '??': 'bg-sky-500/15 text-sky-600 border-sky-500/30 dark:text-sky-400',
  R: 'bg-violet-500/15 text-violet-600 border-violet-500/30 dark:text-violet-400',
  '!!': 'bg-muted text-muted-foreground border-border'
};

const STATUS_ICON: Record<FileChange['status'], ReactNode> = {
  M: <FileEdit className="size-3.5" aria-hidden="true" />,
  A: <FilePlus2 className="size-3.5" aria-hidden="true" />,
  D: <FileMinus2 className="size-3.5" aria-hidden="true" />,
  '??': <FileQuestion className="size-3.5" aria-hidden="true" />,
  R: <FileSymlink className="size-3.5" aria-hidden="true" />,
  '!!': <EyeOff className="size-3.5" aria-hidden="true" />
};

const basenameFor = (path: string): string => {
  const idx = Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\'));
  return idx === -1 ? path : path.slice(idx + 1);
};

const dirnameFor = (path: string): string => {
  const idx = Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\'));
  if (idx === -1) return '';
  return path.slice(0, idx + 1);
};

export const FileChangeListRow: FC<FileChangeListRowProps> = ({
  change,
  onSelect
}) => {
  const label = FILE_CHANGE_STATUS_LABELS[change.status];
  const baseName = basenameFor(change.path);
  const dirName = dirnameFor(change.path);
  const interactive = Boolean(onSelect);

  const handleClick = (): void => {
    onSelect?.(change.path);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (!interactive) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect?.(change.path);
    }
  };

  return (
    <div
      role="button"
      tabIndex={interactive ? 0 : -1}
      aria-label={`${label}: ${change.path}`}
      onClick={interactive ? handleClick : undefined}
      onKeyDown={interactive ? handleKeyDown : undefined}
      className={cn(
        'flex items-center gap-3 rounded-md border border-border/60 bg-card px-3 py-2 text-sm',
        interactive && 'hover:border-primary/60 hover:bg-accent/40 cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus:outline-none'
      )}
    >
      <span
        className={cn(
          'inline-flex shrink-0 items-center justify-center rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide',
          STATUS_BADGE_CLASS[change.status]
        )}
      >
        {STATUS_ICON[change.status]}
        <span className="ml-1">{change.status}</span>
      </span>

      <div className="flex min-w-0 flex-1 flex-col">
        <span className="text-foreground truncate font-mono text-xs">{baseName}</span>
        {dirName ? (
          <span className="text-muted-foreground truncate font-mono text-[10px]">
            {dirName}
          </span>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center gap-1 text-[10px] uppercase">
        {change.isStaged ? (
          <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-emerald-600 dark:text-emerald-400">
            staged
          </span>
        ) : null}
        {change.isUnstaged ? (
          <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-amber-600 dark:text-amber-400">
            unstaged
          </span>
        ) : null}
      </div>

      {interactive ? (
        <Eye
          aria-hidden="true"
          className="text-muted-foreground size-4 shrink-0"
        />
      ) : null}
    </div>
  );
};