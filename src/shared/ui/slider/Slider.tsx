import { Slider as BaseSlider } from '@base-ui/react/slider';
import type { FC } from 'react';

import { cn } from '@/shared/lib/theme';

import type {
  SliderControlProps,
  SliderIndicatorProps,
  SliderLabelProps,
  SliderRootProps,
  SliderThumbProps,
  SliderTrackProps,
  SliderValueProps
} from './types';

const Root: FC<SliderRootProps> = ({ className, ...rest }) => (
  <BaseSlider.Root
    className={cn('flex w-full flex-col gap-2', className)}
    {...rest}
  />
);

const Control: FC<SliderControlProps> = ({ className, ...rest }) => (
  <BaseSlider.Control
    className={cn(
      'relative flex w-full touch-none items-center select-none',
      className
    )}
    {...rest}
  />
);

const Track: FC<SliderTrackProps> = ({ className, ...rest }) => (
  <BaseSlider.Track
    className={cn(
      'bg-muted relative h-1.5 w-full grow rounded-full',
      className
    )}
    {...rest}
  />
);

const Indicator: FC<SliderIndicatorProps> = ({ className, ...rest }) => (
  <BaseSlider.Indicator
    className={cn('bg-primary absolute h-full rounded-full', className)}
    {...rest}
  />
);

const Thumb: FC<SliderThumbProps> = ({ className, ...rest }) => (
  <BaseSlider.Thumb
    className={cn(
      'border-primary bg-background focus-visible:ring-ring block size-4 rounded-full border-2 shadow-sm outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
      className
    )}
    {...rest}
  />
);

const Value: FC<SliderValueProps> = ({ className, ...rest }) => (
  <BaseSlider.Value
    className={cn('text-muted-foreground text-sm tabular-nums', className)}
    {...rest}
  />
);

const Label: FC<SliderLabelProps> = ({ className, ...rest }) => (
  <BaseSlider.Label
    className={cn('text-foreground text-sm font-medium', className)}
    {...rest}
  />
);

const Slider = { Root, Control, Track, Indicator, Thumb, Value, Label };

export { Slider, Root, Control, Track, Indicator, Thumb, Value, Label };
