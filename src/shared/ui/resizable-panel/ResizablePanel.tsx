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
      'group/handle bg-border relative flex items-center justify-center transition-colors',
      'data-[separator=vertical]:w-px data-[separator=vertical]:cursor-col-resize',
      'data-[separator=horizontal]:h-px data-[separator=horizontal]:cursor-row-resize',
      'hover:bg-primary focus-visible:bg-ring focus-visible:outline-none',
      className
    )}
    {...rest}
  >
    {children ?? (
      <span
        aria-hidden
        className={cn(
          'bg-muted-foreground/50 group-hover/handle:bg-primary-foreground/80 rounded-sm',
          'group-data-[separator=vertical]/handle:h-6 group-data-[separator=vertical]/handle:w-0.5',
          'group-data-[separator=horizontal]/handle:h-0.5 group-data-[separator=horizontal]/handle:w-6'
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
