import type { ComponentProps } from 'react';

import {
  Command as CmdkCommand,
  CommandDialog as CmdkDialog,
  CommandEmpty as CmdkEmpty,
  CommandGroup as CmdkGroup,
  CommandInput as CmdkInput,
  CommandItem as CmdkItem,
  CommandList as CmdkList,
  CommandLoading as CmdkLoading,
  CommandSeparator as CmdkSeparator
} from 'cmdk';

export type CommandRootProps = ComponentProps<typeof CmdkCommand>;

export type CommandDialogProps = ComponentProps<typeof CmdkDialog>;

export type CommandInputProps = ComponentProps<typeof CmdkInput>;

export type CommandListProps = ComponentProps<typeof CmdkList>;

export type CommandEmptyProps = ComponentProps<typeof CmdkEmpty>;

export type CommandLoadingProps = ComponentProps<typeof CmdkLoading>;

export type CommandItemProps = ComponentProps<typeof CmdkItem>;

export type CommandGroupProps = ComponentProps<typeof CmdkGroup>;

export type CommandSeparatorProps = ComponentProps<typeof CmdkSeparator>;
