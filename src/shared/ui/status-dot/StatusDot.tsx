import type { FC } from 'react';

import { cn } from '@/shared/lib/theme';

import type { StatusDotProps } from './types';

const VARIANT_BG: Record<StatusDotProps['variant'], string> = {
  clean: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger'
};

export const StatusDot: FC<StatusDotProps> = ({
  variant,
  label,
  className,
  'aria-label': ariaLabelProp,
  ...rest
}) => {
  const ariaLabel = label ?? ariaLabelProp ?? variant;
  return (
    <span
      {...rest}
      role="status"
      aria-label={ariaLabel}
      className={cn(
        'inline-block size-2 shrink-0 rounded-full',
        VARIANT_BG[variant],
        className
      )}
    />
  );
};

StatusDot.displayName = 'StatusDot';
