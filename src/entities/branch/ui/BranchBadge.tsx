import { GitBranch } from 'lucide-react';
import type { FC } from 'react';

import { Badge } from '@/shared/ui/badge';
import { cn } from '@/shared/lib/theme';

import type { BranchBadgeProps } from './types';

export const BranchBadge: FC<BranchBadgeProps> = ({
  name,
  current = false,
  upstream,
  className
}) => {
  const variant = current ? 'default' : 'secondary';

  return (
    <Badge variant={variant} size="sm" className={cn('gap-1', className)}>
      <GitBranch className="h-3 w-3" aria-hidden="true" />
      <span className="font-mono">{name}</span>
      {upstream ? (
        <span className="text-[10px] opacity-80">
          ↑{upstream.ahead}↓{upstream.behind}
        </span>
      ) : null}
    </Badge>
  );
};
