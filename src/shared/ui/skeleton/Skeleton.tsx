import type { FC } from 'react';

import { cn } from '@/shared/lib/theme';

import type { SkeletonProps } from './types';

const Skeleton: FC<SkeletonProps> = ({ className, ...props }) => (
  <div
    className={cn('bg-muted animate-pulse rounded-md', className)}
    {...props}
  />
);

export { Skeleton };
