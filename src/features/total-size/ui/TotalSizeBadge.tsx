import { HardDrive } from 'lucide-react';
import type { FC } from 'react';

import { useRepositorySize } from '@/entities/repository';
import { Badge } from '@/shared/ui';
import { cn } from '@/shared/lib/theme';

import { formatSize } from '../lib';

import type { TotalSizeBadgeProps } from './types';

export const TotalSizeBadge: FC<TotalSizeBadgeProps> = ({
  repoPath,
  className
}) => {
  const { data, isLoading } = useRepositorySize(repoPath);

  const label = !repoPath
    ? '—'
    : isLoading || !data
      ? '…'
      : formatSize(data.totalBytes);

  return (
    <Badge
      variant="outline"
      size="sm"
      className={cn('font-mono tabular-nums', className)}
      title={
        data
          ? `${formatSize(data.totalBytes)} total · ${formatSize(data.gitBytes)} .git`
          : undefined
      }
    >
      <HardDrive className="size-3" aria-hidden="true" />
      <span>{label}</span>
    </Badge>
  );
};

TotalSizeBadge.displayName = 'TotalSizeBadge';
