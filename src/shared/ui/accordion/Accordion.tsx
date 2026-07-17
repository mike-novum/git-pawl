import { Accordion as BaseAccordion } from '@base-ui/react/accordion';
import type { FC } from 'react';

import { cn } from '@/shared/lib/theme';

import type {
  AccordionHeaderProps,
  AccordionItemProps,
  AccordionPanelProps,
  AccordionRootProps,
  AccordionTriggerProps
} from './types';

const Root = <TValue,>({
  className,
  ...rest
}: AccordionRootProps<TValue>) => (
  <BaseAccordion.Root
    className={cn('divide-border flex w-full flex-col divide-y', className)}
    {...(rest as AccordionRootProps)}
  />
);

const Item: FC<AccordionItemProps> = ({ className, ...rest }) => (
  <BaseAccordion.Item className={cn('flex flex-col', className)} {...rest} />
);

const Header: FC<AccordionHeaderProps> = ({ className, ...rest }) => (
  <BaseAccordion.Header
    className={cn('flex items-center justify-between', className)}
    {...rest}
  />
);

const Trigger: FC<AccordionTriggerProps> = ({ className, children, ...rest }) => (
  <BaseAccordion.Trigger
    className={cn(
      'text-foreground hover:bg-muted flex w-full items-center justify-between gap-2 px-3 py-3 text-left text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring',
      className
    )}
    {...rest}
  >
    {children}
    <span
      aria-hidden
      className="text-muted-foreground text-xs transition-transform group-data-[panel-open]/trigger:rotate-180"
    >
      ▾
    </span>
  </BaseAccordion.Trigger>
);

const Panel: FC<AccordionPanelProps> = ({ className, children, ...rest }) => (
  <BaseAccordion.Panel
    className={cn(
      'text-muted-foreground px-3 pb-4 text-sm',
      className
    )}
    {...rest}
  >
    {children}
  </BaseAccordion.Panel>
);

const Accordion = { Root, Item, Header, Trigger, Panel };

export { Accordion, Root, Item, Header, Trigger, Panel };
