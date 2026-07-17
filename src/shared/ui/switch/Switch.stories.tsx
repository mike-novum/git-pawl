import type { Meta, StoryObj } from '@storybook/react';

import { Switch } from './Switch';

const meta = {
  title: 'UI/Switch',
  component: Switch.Root
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Switch.Root defaultChecked>
        <Switch.Thumb />
      </Switch.Root>
      <span className="text-sm">Auto-fetch</span>
    </div>
  )
};

export const Unchecked: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Switch.Root>
        <Switch.Thumb />
      </Switch.Root>
      <span className="text-sm">Notifications</span>
    </div>
  )
};

export const Disabled: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Switch.Root disabled defaultChecked>
        <Switch.Thumb />
      </Switch.Root>
      <span className="text-muted-foreground text-sm">Locked option</span>
    </div>
  )
};
