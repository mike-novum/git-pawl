import type { ComponentProps, ReactNode } from 'react';

import type { Popover } from '@base-ui/react/popover';

export type PopoverRootProps = ComponentProps<typeof Popover.Root>;

export type PopoverTriggerProps = ComponentProps<typeof Popover.Trigger> & {
  children: ReactNode;
};

export type PopoverPortalProps = ComponentProps<typeof Popover.Portal>;

export type PopoverContentProps = Omit<
  ComponentProps<typeof Popover.Popup>,
  'children'
> & {
  children: ReactNode;
};

export type PopoverArrowProps = ComponentProps<typeof Popover.Arrow>;

export type PopoverTitleProps = ComponentProps<typeof Popover.Title>;

export type PopoverDescriptionProps = ComponentProps<typeof Popover.Description>;

export type PopoverCloseProps = ComponentProps<typeof Popover.Close> & {
  children: ReactNode;
};

export type PopoverPositionerProps = ComponentProps<typeof Popover.Positioner>;
