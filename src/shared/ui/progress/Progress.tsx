import { Progress as BaseProgress } from '@base-ui/react/progress';
import type { FC } from 'react';

import { cn } from '@/shared/lib/theme';

import type {
  ProgressIndicatorProps,
  ProgressLabelProps,
  ProgressRootProps,
  ProgressTrackProps,
  ProgressValueProps
} from './types';

const Root: FC<ProgressRootProps> = ({ className, ...rest }) => (
  <BaseProgress.Root
    className={cn('flex w-full flex-col gap-2', className)}
    {...rest}
  />
);

const Track: FC<ProgressTrackProps> = ({ className, ...rest }) => (
  <BaseProgress.Track
    className={cn(
      'bg-muted relative h-2 w-full overflow-hidden rounded-full',
      className
    )}
    {...rest}
  />
);

const Indicator: FC<ProgressIndicatorProps> = ({ className, ...rest }) => (
  <BaseProgress.Indicator
    className={cn('bg-primary h-full transition-all', className)}
    {...rest}
  />
);

const Value: FC<ProgressValueProps> = ({ className, ...rest }) => (
  <BaseProgress.Value
    className={cn('text-muted-foreground text-sm tabular-nums', className)}
    {...rest}
  />
);

const Label: FC<ProgressLabelProps> = ({ className, ...rest }) => (
  <BaseProgress.Label
    className={cn('text-foreground text-sm font-medium', className)}
    {...rest}
  />
);

const Progress = { Root, Track, Indicator, Value, Label };

export { Progress, Root, Track, Indicator, Value, Label };
