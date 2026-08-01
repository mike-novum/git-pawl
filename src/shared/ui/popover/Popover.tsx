import { Popover as BasePopover } from '@base-ui/react/popover';
import type { FC } from 'react';

import { cn, Z_POPUP } from '@/shared/lib/theme';

import type {
  PopoverArrowProps,
  PopoverCloseProps,
  PopoverContentProps,
  PopoverDescriptionProps,
  PopoverPortalProps,
  PopoverPositionerProps,
  PopoverRootProps,
  PopoverTitleProps,
  PopoverTriggerProps
} from './types';

const Root: FC<PopoverRootProps> = (props) => <BasePopover.Root {...props} />;

const Trigger: FC<PopoverTriggerProps> = ({ className, ...rest }) => (
  <BasePopover.Trigger
    className={cn(
      'inline-flex items-center justify-center rounded-md text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring',
      className
    )}
    {...rest}
  />
);

const Portal: FC<PopoverPortalProps> = (props) => <BasePopover.Portal {...props} />;

const Positioner: FC<PopoverPositionerProps> = ({ className, sideOffset = 6, ...rest }) => (
  <BasePopover.Positioner
    sideOffset={sideOffset}
    className={cn(Z_POPUP, 'outline-none', className)}
    {...rest}
  />
);

const Content: FC<PopoverContentProps> = ({ className, children, ...rest }) => (
  <BasePopover.Popup
    className={cn(
      'bg-background text-foreground w-72 rounded-md border border-border p-4 shadow-md outline-none',
      className
    )}
    {...rest}
  >
    {children}
  </BasePopover.Popup>
);

const Arrow: FC<PopoverArrowProps> = ({ className, ...rest }) => (
  <BasePopover.Arrow
    className={cn('fill-background', className)}
    {...rest}
  />
);

const Title: FC<PopoverTitleProps> = ({ className, ...rest }) => (
  <BasePopover.Title
    className={cn('text-base font-semibold leading-none', className)}
    {...rest}
  />
);

const Description: FC<PopoverDescriptionProps> = ({ className, ...rest }) => (
  <BasePopover.Description
    className={cn('text-muted-foreground text-sm', className)}
    {...rest}
  />
);

const Close: FC<PopoverCloseProps> = ({ className, ...rest }) => (
  <BasePopover.Close
    className={cn(
      'rounded-sm text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring',
      className
    )}
    {...rest}
  />
);

const Popover = {
  Root,
  Trigger,
  Portal,
  Positioner,
  Content,
  Arrow,
  Title,
  Description,
  Close
};

export { Popover, Root, Trigger, Portal, Positioner, Content, Arrow, Title, Description, Close };
