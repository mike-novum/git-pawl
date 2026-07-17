import type { FC } from 'react';

import { cn } from '@/shared/lib/theme';

import { badgeVariants } from './Badge.variants';
import type { BadgeProps } from './types';

const Badge: FC<BadgeProps> = ({ className, variant, size, ...props }) => (
  <span className={cn(badgeVariants({ variant, size }), className)} {...props} />
);

export { Badge };
