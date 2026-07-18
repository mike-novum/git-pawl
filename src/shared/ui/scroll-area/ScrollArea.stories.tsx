import type { Meta, StoryObj } from '@storybook/react';

import {
  ScrollAreaRoot,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaViewport
} from './ScrollArea';

const ITEMS = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  label: `Repository #${i + 1}`
}));

const meta: Meta<typeof ScrollAreaRoot> = {
  title: 'UI/ScrollArea',
  component: ScrollAreaRoot
};

export default meta;

type Story = StoryObj<typeof ScrollAreaRoot>;

export const Vertical: Story = {
  render: () => (
    <ScrollAreaRoot className="bg-card h-64 w-72 rounded-md border">
      <ScrollAreaViewport>
        <ul className="p-4">
          {ITEMS.map((item) => (
            <li key={item.id} className="py-1 text-sm">
              {item.label}
            </li>
          ))}
        </ul>
      </ScrollAreaViewport>
      <ScrollAreaScrollbar orientation="vertical">
        <ScrollAreaThumb />
      </ScrollAreaScrollbar>
    </ScrollAreaRoot>
  )
};

export const Horizontal: Story = {
  render: () => (
    <ScrollAreaRoot className="bg-card w-80 rounded-md border">
      <ScrollAreaViewport>
        <div className="flex w-max gap-4 p-4">
          {Array.from({ length: 12 }, (_, i) => (
            <div
              key={i}
              className="bg-muted flex h-16 w-32 shrink-0 items-center justify-center rounded text-xs"
            >
              Card {i + 1}
            </div>
          ))}
        </div>
      </ScrollAreaViewport>
      <ScrollAreaScrollbar orientation="horizontal" className="!flex">
        <ScrollAreaThumb />
      </ScrollAreaScrollbar>
    </ScrollAreaRoot>
  )
};
