import type { FC } from 'react';

import { cn } from '@/shared/lib/theme';

import type { KbdProps } from './types';

const Kbd: FC<KbdProps> = ({ keys, className, children, ...props }) => {
  if (keys && keys.length > 0) {
    return (
      <span className={cn('inline-flex items-center gap-1', className)}>
        {keys.map((key, index) => (
          <kbd
            key={`${key}-${index}`}
            className={cn(
              'bg-muted text-muted-foreground inline-flex h-5 min-w-5 items-center justify-center rounded border px-1.5 font-mono text-[0.7rem] font-medium shadow-sm'
            )}
            {...props}
          >
            {key}
          </kbd>
        ))}
      </span>
    );
  }

  return (
    <kbd
      className={cn(
        'bg-muted text-muted-foreground inline-flex h-5 min-w-5 items-center justify-center rounded border px-1.5 font-mono text-[0.7rem] font-medium shadow-sm',
        className
      )}
      {...props}
    >
      {children}
    </kbd>
  );
};

export { Kbd };
