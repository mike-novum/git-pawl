import type { FC } from 'react';

import { cn } from '@/shared/lib/theme';

import type { CommitHashProps } from './types';

const DEFAULT_LENGTH = 7;

export const CommitHash: FC<CommitHashProps> = ({
  hash,
  length = DEFAULT_LENGTH,
  className
}) => {
  const short = hash.length > length ? hash.slice(0, length) : hash;
  const full = hash;

  return (
    <code
      className={cn(
        'rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground/80 tabular-nums',
        className
      )}
      title={full}
      aria-label={`Commit hash ${full}`}
    >
      {short}
    </code>
  );
};
