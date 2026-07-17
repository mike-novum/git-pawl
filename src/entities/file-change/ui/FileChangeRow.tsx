import {
  FilePlus2,
  FileMinus2,
  FileEdit,
  FileQuestion,
  FileSymlink,
  EyeOff
} from 'lucide-react';
import type { FC, ReactNode } from 'react';

import { cn } from '@/shared/lib/theme';

import { FILE_CHANGE_STATUS_LABELS } from '../model/types';
import type { FileChange } from '../model/types';
import type { FileChangeRowProps } from './types';

const STATUS_ICON_COLOR: Record<FileChange['status'], string> = {
  M: 'text-amber-500',
  A: 'text-emerald-500',
  D: 'text-rose-500',
  '??': 'text-sky-500',
  R: 'text-violet-500',
  '!!': 'text-muted-foreground'
};

const STATUS_ICON: Record<FileChange['status'], ReactNode> = {
  M: <FileEdit className="h-4 w-4" aria-hidden="true" />,
  A: <FilePlus2 className="h-4 w-4" aria-hidden="true" />,
  D: <FileMinus2 className="h-4 w-4" aria-hidden="true" />,
  '??': <FileQuestion className="h-4 w-4" aria-hidden="true" />,
  R: <FileSymlink className="h-4 w-4" aria-hidden="true" />,
  '!!': <EyeOff className="h-4 w-4" aria-hidden="true" />
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

export const FileChangeRow: FC<FileChangeRowProps> = ({ change, className }) => {
  const label = FILE_CHANGE_STATUS_LABELS[change.status];
  const baseName = basenameFor(change.path);
  const dirName = dirnameFor(change.path);

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-md border border-border/60 bg-card px-3 py-2 text-sm',
        className
      )}
      role="listitem"
      aria-label={`${label}: ${change.path}`}
    >
      <span className={cn('shrink-0', STATUS_ICON_COLOR[change.status])}>
        {STATUS_ICON[change.status]}
      </span>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="text-foreground truncate font-mono text-xs">{baseName}</span>
        {dirName ? (
          <span className="text-muted-foreground truncate font-mono text-[10px]">
            {dirName}
          </span>
        ) : null}
      </div>
      <div className="flex items-center gap-1 text-[10px] uppercase">
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
    </div>
  );
};
