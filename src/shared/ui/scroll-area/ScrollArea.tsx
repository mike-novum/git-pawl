import { ScrollArea as BaseScrollArea } from '@base-ui/react/scroll-area';
import type { FC } from 'react';

import { cn } from '@/shared/lib/theme';

import type {
  ScrollAreaRootProps,
  ScrollAreaScrollbarProps,
  ScrollAreaThumbProps,
  ScrollAreaViewportProps
} from './types';

const ScrollAreaRoot: FC<ScrollAreaRootProps> = ({ className, ...props }) => (
  <BaseScrollArea.Root
    className={cn('relative overflow-hidden', className)}
    {...props}
  />
);

const ScrollAreaViewport: FC<ScrollAreaViewportProps> = ({
  className,
  ...props
}) => (
  <BaseScrollArea.Viewport
    className={cn('h-full w-full rounded-[inherit]', className)}
    {...props}
  />
);

const ScrollAreaScrollbar: FC<ScrollAreaScrollbarProps> = ({
  className,
  orientation = 'vertical',
  ...props
}) => (
  <BaseScrollArea.Scrollbar
    orientation={orientation}
    className={cn(
      'flex touch-none select-none p-0.5 transition-colors duration-fast',
      orientation === 'vertical' ? 'h-full w-2' : 'h-2 flex-col',
      className
    )}
    {...props}
  />
);

const ScrollAreaThumb: FC<ScrollAreaThumbProps> = ({ className, ...props }) => (
  <BaseScrollArea.Thumb
    className={cn(
      'bg-border relative flex-1 rounded-full',
      className
    )}
    {...props}
  />
);

export {
  ScrollAreaRoot,
  ScrollAreaViewport,
  ScrollAreaScrollbar,
  ScrollAreaThumb
};
