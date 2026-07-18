import type { Meta, StoryObj } from '@storybook/react';

import { Button } from '@/shared/ui/button';

import { Tooltip } from './Tooltip';

const meta: Meta<typeof Tooltip> = {
  title: 'UI/Tooltip',
  component: Tooltip
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
  args: {
    content: 'Save file',
    children: <Button>Hover me</Button>
  }
};

export const SideVariants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center justify-center gap-12 p-16">
      <Tooltip content="Top tooltip" side="top">
        <Button variant="secondary">Top</Button>
      </Tooltip>
      <Tooltip content="Right tooltip" side="right">
        <Button variant="secondary">Right</Button>
      </Tooltip>
      <Tooltip content="Bottom tooltip" side="bottom">
        <Button variant="secondary">Bottom</Button>
      </Tooltip>
      <Tooltip content="Left tooltip" side="left">
        <Button variant="secondary">Left</Button>
      </Tooltip>
    </div>
  )
};

export const WithDelay: Story = {
  args: {
    content: 'Delayed tooltip (700ms)',
    delay: 700,
    children: <Button variant="ghost">Hover and wait</Button>
  }
};
