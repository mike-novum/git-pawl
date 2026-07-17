import { HardDrive } from 'lucide-react';
import type { FC } from 'react';

import { Badge } from '@/shared/ui';
import { cn } from '@/shared/lib/theme';

import { formatSize } from '../lib';
import { useWorkspaceTotalSize } from '../model';

import type { WorkspaceTotalSizeProps } from './types';

export const WorkspaceTotalSize: FC<WorkspaceTotalSizeProps> = ({
  workspacePath,
  className
}) => {
  const { data, isLoading } = useWorkspaceTotalSize(workspacePath);

  const label = !workspacePath
    ? '—'
    : isLoading || !data
      ? '…'
      : formatSize(data.totalBytes);

  const title = data
    ? `${formatSize(data.totalBytes)} total · ${formatSize(data.gitBytes)} .git · ${data.repoCount} ${
        data.repoCount === 1 ? 'repo' : 'repos'
      }`
    : undefined;

  return (
    <Badge
      variant="outline"
      size="sm"
      className={cn('font-mono tabular-nums', className)}
      title={title}
    >
      <HardDrive className="size-3" aria-hidden="true" />
      <span>{label}</span>
    </Badge>
  );
};

WorkspaceTotalSize.displayName = 'WorkspaceTotalSize';
