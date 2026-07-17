import type { FC } from 'react';

import { cn } from '@/shared/lib/theme';

import type { SpinnerProps, SpinnerSize } from './types';

const sizeMap: Record<SpinnerSize, number> = {
  sm: 14,
  md: 20,
  lg: 28
};

const strokeMap: Record<SpinnerSize, number> = {
  sm: 2,
  md: 2,
  lg: 2.5
};

const Spinner: FC<SpinnerProps> = ({ size = 'md', className, label = 'Loading' }) => {
  const px = sizeMap[size];
  const stroke = strokeMap[size];

  return (
    <span
      role="status"
      aria-label={label}
      className={cn('inline-flex', className)}
    >
      <svg
        width={px}
        height={px}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-muted-foreground animate-spin"
      >
        <circle
          cx="12"
          cy="12"
          r="9"
          stroke="currentColor"
          strokeOpacity="0.25"
          strokeWidth={stroke}
        />
        <path
          d="M21 12a9 9 0 0 0-9-9"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
};

export { Spinner };
