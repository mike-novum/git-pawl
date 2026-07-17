import type { Accordion } from '@base-ui/react/accordion';
import type { ComponentProps, ReactNode } from 'react';

export type AccordionRootProps<TValue = string> = ComponentProps<typeof Accordion.Root<TValue>>;

export type AccordionItemProps = ComponentProps<typeof Accordion.Item> & {
  children: ReactNode;
};

export type AccordionHeaderProps = ComponentProps<typeof Accordion.Header> & {
  children: ReactNode;
};

export type AccordionTriggerProps = ComponentProps<typeof Accordion.Trigger> & {
  children: ReactNode;
};

export type AccordionPanelProps = ComponentProps<typeof Accordion.Panel> & {
  children: ReactNode;
};
