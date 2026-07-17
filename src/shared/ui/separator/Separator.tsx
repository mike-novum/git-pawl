import { Separator as BaseSeparator } from '@base-ui/react/separator';
import type { FC } from 'react';

import { cn } from '@/shared/lib/theme';

import type { SeparatorProps } from './types';

const Separator: FC<SeparatorProps> = ({
  orientation = 'horizontal',
  className,
  ...props
}) => (
  <BaseSeparator
    orientation={orientation}
    className={cn(
      'bg-border shrink-0',
      orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
      className
    )}
    {...props}
  />
);

export { Separator };
