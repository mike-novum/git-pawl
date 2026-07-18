import type { Meta, StoryObj } from '@storybook/react';
import type { FC } from 'react';

import {
  SheetBackdrop,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetPortal,
  SheetRoot,
  SheetTitle,
  SheetTrigger
} from './Sheet';

type SheetStoryProps = {
  triggerLabel: string;
  title: string;
  description: string;
};

const Template: FC<SheetStoryProps> = ({
  triggerLabel,
  title,
  description
}) => (
  <SheetRoot>
    <SheetTrigger className="bg-primary text-primary-foreground rounded-md px-3 py-1.5 text-sm">
      {triggerLabel}
    </SheetTrigger>
    <SheetPortal>
      <SheetBackdrop />
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-auto text-sm">
          <p>
            Sheet slides in from the right with a fade backdrop. Aria roles and focus
            trapping are inherited from the underlying Base UI Dialog primitive.
          </p>
        </div>
        <SheetFooter>
          <SheetClose className="bg-muted text-foreground rounded-md px-3 py-1.5 text-sm">
            Cancel
          </SheetClose>
          <SheetClose className="bg-primary text-primary-foreground rounded-md px-3 py-1.5 text-sm">
            Confirm
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </SheetPortal>
  </SheetRoot>
);

const meta: Meta<typeof Template> = {
  title: 'UI/Sheet',
  component: Template,
  args: {
    triggerLabel: 'Open sheet',
    title: 'Open repository',
    description: 'Choose a folder, remote, or create a new one.'
  }
};

export default meta;

type Story = StoryObj<typeof Template>;

export const Right: Story = {};

export const Left: Story = {
  args: { triggerLabel: 'Open left' },
  render: (args) => (
    <SheetRoot>
      <SheetTrigger className="bg-muted text-foreground rounded-md px-3 py-1.5 text-sm">
        {args.triggerLabel}
      </SheetTrigger>
      <SheetPortal>
        <SheetBackdrop />
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>{args.title}</SheetTitle>
            <SheetDescription>{args.description}</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </SheetPortal>
    </SheetRoot>
  )
};

export const Top: Story = {
  args: { triggerLabel: 'Open from top' },
  render: (args) => (
    <SheetRoot>
      <SheetTrigger className="bg-muted text-foreground rounded-md px-3 py-1.5 text-sm">
        {args.triggerLabel}
      </SheetTrigger>
      <SheetPortal>
        <SheetBackdrop />
        <SheetContent side="top">
          <SheetHeader>
            <SheetTitle>{args.title}</SheetTitle>
            <SheetDescription>{args.description}</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </SheetPortal>
    </SheetRoot>
  )
};

export const Bottom: Story = {
  args: { triggerLabel: 'Open from bottom' },
  render: (args) => (
    <SheetRoot>
      <SheetTrigger className="bg-muted text-foreground rounded-md px-3 py-1.5 text-sm">
        {args.triggerLabel}
      </SheetTrigger>
      <SheetPortal>
        <SheetBackdrop />
        <SheetContent side="bottom">
          <SheetHeader>
            <SheetTitle>{args.title}</SheetTitle>
            <SheetDescription>{args.description}</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </SheetPortal>
    </SheetRoot>
  )
};
