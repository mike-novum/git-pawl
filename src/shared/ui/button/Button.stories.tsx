import type { Meta, StoryObj } from '@storybook/react';
import { Save, Trash2 } from 'lucide-react';

import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  args: {
    children: 'Click me'
  }
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="link">Link</Button>
    </div>
  )
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  )
};

export const WithIcons: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Button leftIcon={<Save />}>Save</Button>
      <Button variant="destructive" leftIcon={<Trash2 />}>
        Delete
      </Button>
    </div>
  )
};

export const Loading: Story = {
  args: {
    loading: true,
    children: 'Saving…'
  }
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Disabled'
  }
};
