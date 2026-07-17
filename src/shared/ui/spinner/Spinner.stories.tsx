import type { Meta, StoryObj } from '@storybook/react';

import { Spinner } from './Spinner';

const meta = {
  title: 'UI/Spinner',
  component: Spinner
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <Spinner />
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Spinner size="sm" />
      <Spinner size="md" />
      <Spinner size="lg" />
    </div>
  )
};

export const WithLabel: Story = {
  render: () => (
    <div className="text-muted-foreground flex items-center gap-2 text-sm">
      <Spinner size="sm" />
      Cloning repository…
    </div>
  )
};
