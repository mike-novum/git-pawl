import type { ComponentProps, FC } from 'react';

import { Tabs as BaseTabs } from '@base-ui/react/tabs';

import { cn } from '@/shared/lib/theme/cn';

export const Root = BaseTabs.Root;
export const Indicator = BaseTabs.Indicator;

export const List: FC<ComponentProps<typeof BaseTabs.List>> = ({ className, ...props }) => (
  <BaseTabs.List
    className={cn(
      'relative inline-flex h-10 items-center justify-start gap-1 rounded-md border border-border bg-muted p-1 text-muted-foreground',
      className
    )}
    {...props}
  />
);

List.displayName = 'Tabs.List';

export const Trigger: FC<ComponentProps<typeof BaseTabs.Tab>> = ({ className, ...props }) => (
  <BaseTabs.Tab
    className={cn(
      'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-colors',
      'outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
      'disabled:pointer-events-none disabled:opacity-50',
      'data-[selected]:bg-background data-[selected]:text-foreground data-[selected]:shadow-sm',
      'hover:text-foreground',
      className
    )}
    {...props}
  />
);

Trigger.displayName = 'Tabs.Trigger';

export const Content: FC<ComponentProps<typeof BaseTabs.Panel>> = ({ className, ...props }) => (
  <BaseTabs.Panel
    className={cn(
      'mt-3 text-sm text-foreground focus-visible:outline-none',
      className
    )}
    {...props}
  />
);

Content.displayName = 'Tabs.Content';

export const Tabs = {
  Root,
  List,
  Trigger,
  Content,
  Indicator
};
