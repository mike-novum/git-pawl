import { Menu as BaseMenu } from '@base-ui/react/menu';
import { Separator as BaseSeparator } from '@base-ui/react/separator';
import type { FC } from 'react';

import { cn } from '@/shared/lib/theme';

import type {
  DropdownMenuCheckboxItemIndicatorProps,
  DropdownMenuCheckboxItemProps,
  DropdownMenuContentProps,
  DropdownMenuGroupProps,
  DropdownMenuItemProps,
  DropdownMenuLabelProps,
  DropdownMenuPortalProps,
  DropdownMenuPositionerProps,
  DropdownMenuRadioGroupProps,
  DropdownMenuRadioItemProps,
  DropdownMenuRootProps,
  DropdownMenuSubmenuTriggerProps,
  DropdownMenuTriggerProps
} from './types';

const DropdownMenuRoot: FC<DropdownMenuRootProps> = (props) => (
  <BaseMenu.Root {...props} />
);

const DropdownMenuTrigger: FC<DropdownMenuTriggerProps> = ({
  className,
  ...props
}) => (
  <BaseMenu.Trigger
    className={cn(
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
      className
    )}
    {...props}
  />
);

const DropdownMenuPortal: FC<DropdownMenuPortalProps> = (props) => (
  <BaseMenu.Portal {...props} />
);

const DropdownMenuPositioner: FC<DropdownMenuPositionerProps> = ({
  className,
  ...props
}) => (
  <BaseMenu.Positioner
    className={cn('outline-none', className)}
    {...props}
  />
);

const DropdownMenuContent: FC<DropdownMenuContentProps> = ({
  className,
  ...props
}) => (
  <BaseMenu.Popup
    className={cn(
      'bg-popover text-popover-foreground z-50 min-w-32 overflow-hidden rounded-md border p-1 shadow-md',
      'origin-[var(--transform-origin)] transition-[transform,opacity]',
      'data-[starting-style]:opacity-0 data-[ending-style]:opacity-0',
      'data-[starting-style]:scale-95 data-[ending-style]:scale-95',
      className
    )}
    {...props}
  />
);

const DropdownMenuItem: FC<DropdownMenuItemProps> = ({ className, ...props }) => (
  <BaseMenu.Item
    className={cn(
      'data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground',
      'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      'flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none',
      className
    )}
    {...props}
  />
);

const DropdownMenuGroup: FC<DropdownMenuGroupProps> = (props) => (
  <BaseMenu.Group {...props} />
);

const DropdownMenuLabel: FC<DropdownMenuLabelProps> = ({ className, ...props }) => (
  <BaseMenu.GroupLabel
    className={cn('text-muted-foreground px-2 py-1.5 text-xs font-semibold', className)}
    {...props}
  />
);

const DropdownMenuSeparator: FC<{ className?: string }> = ({ className }) => (
  <BaseSeparator className={cn('bg-border -mx-1 my-1 h-px', className)} />
);

const DropdownMenuSubmenuTrigger: FC<DropdownMenuSubmenuTriggerProps> = ({
  className,
  ...props
}) => (
  <BaseMenu.SubmenuTrigger
    className={cn(
      'data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground',
      'flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-none select-none',
      className
    )}
    {...props}
  />
);

const DropdownMenuRadioGroup: FC<DropdownMenuRadioGroupProps> = (props) => (
  <BaseMenu.RadioGroup {...props} />
);

const DropdownMenuRadioItem: FC<DropdownMenuRadioItemProps> = ({
  className,
  ...props
}) => (
  <BaseMenu.RadioItem
    className={cn(
      'data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground',
      'flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none',
      className
    )}
    {...props}
  />
);

const DropdownMenuCheckboxItem: FC<DropdownMenuCheckboxItemProps> = ({
  className,
  ...props
}) => (
  <BaseMenu.CheckboxItem
    className={cn(
      'data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground',
      'flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none',
      className
    )}
    {...props}
  />
);

const DropdownMenuCheckboxItemIndicator: FC<DropdownMenuCheckboxItemIndicatorProps> = ({
  className,
  ...props
}) => (
  <BaseMenu.CheckboxItemIndicator
    className={cn('flex items-center justify-center', className)}
    {...props}
  />
);

export {
  DropdownMenuRoot,
  DropdownMenuTrigger,
  DropdownMenuPortal,
  DropdownMenuPositioner,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSubmenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuCheckboxItem,
  DropdownMenuCheckboxItemIndicator
};
