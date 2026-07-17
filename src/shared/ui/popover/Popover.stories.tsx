import type { Meta, StoryObj } from '@storybook/react';

import { Popover } from './Popover';

const meta = {
  title: 'UI/Popover',
  component: Popover.Root
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Popover.Root>
      <Popover.Trigger className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2">
        Open popover
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner>
          <Popover.Content>
            <Popover.Title>Repository info</Popover.Title>
            <Popover.Description className="mt-1">
              Details about the current repository and its configuration.
            </Popover.Description>
            <div className="text-muted-foreground mt-3 text-xs">Press Esc to close.</div>
          </Popover.Content>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )
};

export const WithActions: Story = {
  render: () => (
    <Popover.Root>
      <Popover.Trigger className="border-border bg-muted text-foreground rounded-md border px-3 py-2 text-sm">
        Branch actions
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner side="bottom" align="start">
          <Popover.Content>
            <Popover.Title>git-pawl / main</Popover.Title>
            <div className="mt-3 flex flex-col gap-1 text-sm">
              <button className="hover:bg-muted rounded px-2 py-1 text-left">Pull</button>
              <button className="hover:bg-muted rounded px-2 py-1 text-left">Push</button>
              <button className="hover:bg-muted rounded px-2 py-1 text-left">Fetch</button>
            </div>
          </Popover.Content>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )
};
