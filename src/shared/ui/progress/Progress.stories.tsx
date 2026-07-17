import type { Meta, StoryObj } from '@storybook/react';

import { Progress } from './Progress';

const meta = {
  title: 'UI/Progress'
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Progress.Root value={60}>
      <Progress.Label>Cloning repository</Progress.Label>
      <Progress.Track>
        <Progress.Indicator />
      </Progress.Track>
      <Progress.Value />
    </Progress.Root>
  )
};

export const Indeterminate: Story = {
  render: () => (
    <Progress.Root value={null}>
      <Progress.Label>Fetching</Progress.Label>
      <Progress.Track>
        <Progress.Indicator className="animate-pulse" />
      </Progress.Track>
    </Progress.Root>
  )
};

export const Small: Story = {
  render: () => (
    <Progress.Root value={35}>
      <Progress.Track className="h-1">
        <Progress.Indicator />
      </Progress.Track>
    </Progress.Root>
  )
};
