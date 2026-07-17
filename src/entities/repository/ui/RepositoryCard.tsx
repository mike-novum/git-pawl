import { GitBranch } from 'lucide-react';
import type { FC, KeyboardEvent } from 'react';

import { Badge } from '@/shared/ui/badge';
import { Card, CardContent } from '@/shared/ui/card';
import { cn } from '@/shared/lib/theme';

import { RepositoryIcon } from './RepositoryIcon';
import type {
  RepositoryBranchBadgeProps,
  RepositoryCardProps,
  RepositorySizeTextProps,
  RepositoryStatusDotProps
} from './types';

const STATUS_DOT_COLORS: Record<RepositoryStatusDotProps['status'], string> = {
  clean: 'bg-emerald-500',
  dirty: 'bg-amber-500',
  unknown: 'bg-muted-foreground'
};

export const RepositoryStatusDot: FC<RepositoryStatusDotProps> = ({
  status,
  className
}) => (
  <span
    aria-label={`Repository status: ${status}`}
    className={cn(
      'inline-block h-2 w-2 shrink-0 rounded-full',
      STATUS_DOT_COLORS[status],
      className
    )}
  />
);

const formatBytes = (bytes: number): string => {
  if (!Number.isFinite(bytes) || bytes < 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  const precision = value >= 100 || unitIndex === 0 ? 0 : 1;
  return `${value.toFixed(precision)} ${units[unitIndex]}`;
};

export const RepositorySizeText: FC<RepositorySizeTextProps> = ({
  bytes,
  className
}) => (
  <span className={cn('text-muted-foreground text-xs tabular-nums', className)}>
    {bytes === null ? '—' : formatBytes(bytes)}
  </span>
);

export const RepositoryBranchBadge: FC<RepositoryBranchBadgeProps> = ({
  branch,
  className
}) => {
  if (!branch) {
    return (
      <Badge variant="outline" size="sm" className={className}>
        detached
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" size="sm" className={cn('gap-1', className)}>
      <GitBranch className="h-3 w-3" aria-hidden="true" />
      {branch}
    </Badge>
  );
};

export const RepositoryCard: FC<RepositoryCardProps> = ({ repo, onClick }) => {
  const handleClick = (): void => {
    if (onClick) onClick();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (!onClick) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <Card
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick ? handleClick : undefined}
      onKeyDown={onClick ? handleKeyDown : undefined}
      className={cn(
        'flex flex-row items-center gap-3 p-3',
        onClick &&
          'hover:bg-muted/50 focus-visible:ring-ring cursor-pointer focus:outline-none focus-visible:ring-2'
      )}
    >
      <RepositoryIcon iconPath={repo.iconPath} name={repo.name} size="md" />
      <CardContent className="flex flex-1 flex-col gap-1 p-0">
        <div className="flex items-center gap-2">
          <span className="text-foreground truncate text-sm font-medium">
            {repo.name}
          </span>
          <RepositoryStatusDot status={repo.status} />
        </div>
        <div className="flex items-center justify-between gap-2">
          <RepositoryBranchBadge branch={repo.currentBranch} />
          <RepositorySizeText bytes={repo.sizeBytes} />
        </div>
      </CardContent>
    </Card>
  );
};