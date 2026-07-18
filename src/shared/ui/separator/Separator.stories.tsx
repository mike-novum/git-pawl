import type { Meta, StoryObj } from '@storybook/react';

import { Separator } from './Separator';

const meta: Meta<typeof Separator> = {
  title: 'UI/Separator',
  component: Separator,
  args: {
    orientation: 'horizontal'
  },
  argTypes: {
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical']
    }
  }
};

export default meta;

type Story = StoryObj<typeof Separator>;

export const Horizontal: Story = {
  render: () => (
    <div className="w-80">
      <p className="text-sm">Section A</p>
      <Separator className="my-3" />
      <p className="text-sm">Section B</p>
    </div>
  )
};

export const Vertical: Story = {
  render: () => (
    <div className="flex h-8 items-center gap-3">
      <span className="text-sm">Left</span>
      <Separator orientation="vertical" />
      <span className="text-sm">Right</span>
    </div>
  )
};
