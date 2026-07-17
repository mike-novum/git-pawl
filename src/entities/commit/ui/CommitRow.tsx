import type { FC } from 'react';

import { AvatarRoot as Avatar, AvatarFallback } from '@/shared/ui/avatar';
import { cn } from '@/shared/lib/theme';

import { CommitHash } from './CommitHash';
import type { CommitRowProps } from './types';

const SHORT_HASH_LENGTH = 7;

const computeRelativeDate = (timestamp: number): string => {
  const now = Date.now();
  const diff = Math.max(0, now - timestamp);
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;
  const month = 30 * day;
  const year = 365 * day;

  if (diff < minute) return 'just now';
  if (diff < hour) {
    const value = Math.floor(diff / minute);
    return `${value} min${value === 1 ? '' : 's'} ago`;
  }
  if (diff < day) {
    const value = Math.floor(diff / hour);
    return `${value} hour${value === 1 ? '' : 's'} ago`;
  }
  if (diff < week) {
    const value = Math.floor(diff / day);
    return `${value} day${value === 1 ? '' : 's'} ago`;
  }
  if (diff < month) {
    const value = Math.floor(diff / week);
    return `${value} week${value === 1 ? '' : 's'} ago`;
  }
  if (diff < year) {
    const value = Math.floor(diff / month);
    return `${value} month${value === 1 ? '' : 's'} ago`;
  }
  const value = Math.floor(diff / year);
  return `${value} year${value === 1 ? '' : 's'} ago`;
};

const initialsFor = (name: string): string => {
  const trimmed = name.trim();
  if (trimmed.length === 0) return '?';
  const parts = trimmed.split(/\s+/);
  const first = parts[0]?.charAt(0) ?? '';
  const second = parts.length > 1 ? (parts[parts.length - 1]?.charAt(0) ?? '') : '';
  return (first + second).toUpperCase() || '?';
};

export const CommitRow: FC<CommitRowProps> = ({ commit, className }) => {
  const relative = computeRelativeDate(commit.date);

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-md border border-border/60 bg-card p-3',
        className
      )}
    >
      <Avatar size="sm">
        <AvatarFallback>{initialsFor(commit.author.name)}</AvatarFallback>
      </Avatar>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-2">
          <CommitHash hash={commit.hash} length={SHORT_HASH_LENGTH} className="shrink-0" />
          <span className="text-foreground truncate text-sm font-medium">
            {commit.subject}
          </span>
        </div>
        <div className="text-muted-foreground flex items-center gap-2 text-xs">
          <span className="truncate">{commit.author.name}</span>
          <span aria-hidden="true">·</span>
          <time dateTime={new Date(commit.date).toISOString()}>{relative}</time>
        </div>
      </div>
    </div>
  );
};
