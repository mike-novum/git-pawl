import { Group, Panel as RppPanel, Separator } from 'react-resizable-panels';
import type { FC } from 'react';

import { cn } from '@/shared/lib/theme';

import type {
  PanelGroupProps,
  PanelHandleProps,
  PanelItemProps,
  ResizablePanelRootProps
} from './types';

const PanelGroup: FC<PanelGroupProps> = ({
  children,
  orientation = 'horizontal',
  className,
  ...rest
}) => (
  <Group
    orientation={orientation}
    className={cn(
      'flex h-full w-full',
      orientation === 'horizontal' ? 'flex-row' : 'flex-col',
      className
    )}
    {...rest}
  >
    {children}
  </Group>
);

const Panel: FC<PanelItemProps> = ({ children, className, ...rest }) => (
  <RppPanel className={cn('flex h-full w-full overflow-hidden', className)} {...rest}>
    {children}
  </RppPanel>
);

const PanelResizeHandle: FC<PanelHandleProps> = ({
  children,
  className,
  ...rest
}) => (
  <Separator
    className={cn(
      'group/handle relative flex items-center justify-center bg-border transition-colors',
      'w-1.5 cursor-col-resize hover:bg-primary/80 active:bg-primary focus-visible:bg-ring focus-visible:outline-none',
      'aria-[orientation=vertical]:w-1.5 aria-[orientation=vertical]:cursor-col-resize',
      'aria-[orientation=horizontal]:h-1.5 aria-[orientation=horizontal]:cursor-row-resize',
      'data-[separator=vertical]:w-1.5 data-[separator=vertical]:cursor-col-resize',
      'data-[separator=horizontal]:h-1.5 data-[separator=horizontal]:cursor-row-resize',
      className
    )}
    {...rest}
  >
    {children ?? (
      <span
        aria-hidden
        className={cn(
          'rounded-sm bg-muted-foreground/40 transition-colors group-hover/handle:bg-primary-foreground',
          'h-6 w-0.5'
        )}
      />
    )}
  </Separator>
);

const Root: FC<ResizablePanelRootProps> = ({ className, children, ...rest }) => (
  <div className={cn('flex h-full w-full', className)} {...rest}>
    {children}
  </div>
);

const ResizablePanel = {
  Root,
  PanelGroup,
  Panel,
  PanelResizeHandle
};

export { ResizablePanel, Root, PanelGroup, Panel, PanelResizeHandle };
