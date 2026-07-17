import { Command as Cmdk } from 'cmdk';
import type { FC } from 'react';

import { cn } from '@/shared/lib/theme';

import type {
  CommandDialogProps,
  CommandEmptyProps,
  CommandGroupProps,
  CommandInputProps,
  CommandItemProps,
  CommandListProps,
  CommandLoadingProps,
  CommandRootProps,
  CommandSeparatorProps
} from './types';

const Root: FC<CommandRootProps> = ({ className, ...rest }) => (
  <Cmdk
    label="Command palette"
    className={cn(
      'bg-background text-foreground flex h-full w-full flex-col overflow-hidden rounded-md',
      className
    )}
    {...rest}
  />
);

const Dialog: FC<CommandDialogProps> = ({ className, ...rest }) => (
  <Cmdk.Dialog
    label="Command palette"
    className={cn(
      'bg-background text-foreground fixed top-1/2 left-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-md border border-border shadow-lg',
      className
    )}
    overlayClassName="fixed inset-0 bg-foreground/40 z-50"
    contentClassName={cn(
      'bg-background text-foreground flex flex-col overflow-hidden rounded-md border border-border shadow-lg'
    )}
    {...rest}
  />
);

const Input: FC<CommandInputProps> = ({ className, ...rest }) => (
  <Cmdk.Input
    placeholder="Type a command or search…"
    className={cn(
      'border-border placeholder:text-muted-foreground flex h-10 w-full border-b bg-transparent px-3 py-2 text-sm outline-none',
      className
    )}
    {...rest}
  />
);

const List: FC<CommandListProps> = ({ className, ...rest }) => (
  <Cmdk.List
    className={cn('max-h-72 overflow-y-auto p-1', className)}
    {...rest}
  />
);

const Empty: FC<CommandEmptyProps> = ({ className, ...rest }) => (
  <Cmdk.Empty
    className={cn('text-muted-foreground py-6 text-center text-sm', className)}
    {...rest}
  />
);

const Loading: FC<CommandLoadingProps> = ({ className, ...rest }) => (
  <Cmdk.Loading
    className={cn('text-muted-foreground py-6 text-center text-sm', className)}
    {...rest}
  />
);

const Group: FC<CommandGroupProps> = ({ className, heading, children, ...rest }) => (
  <Cmdk.Group
    heading={heading}
    className={cn(
      'text-foreground [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs',
      className
    )}
    {...rest}
  >
    {children}
  </Cmdk.Group>
);

const Item: FC<CommandItemProps> = ({ className, ...rest }) => (
  <Cmdk.Item
    className={cn(
      'data-[selected=true]:bg-muted text-foreground relative flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-none select-none',
      className
    )}
    {...rest}
  />
);

const Separator: FC<CommandSeparatorProps> = ({ className, ...rest }) => (
  <Cmdk.Separator
    className={cn('bg-border -mx-1 my-1 h-px', className)}
    {...rest}
  />
);

const Command = {
  Root,
  Dialog,
  Input,
  List,
  Empty,
  Loading,
  Group,
  Item,
  Separator
};

export {
  Command,
  Root,
  Dialog,
  Input,
  List,
  Empty,
  Loading,
  Group,
  Item,
  Separator
};
