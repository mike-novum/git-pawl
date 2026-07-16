import type { Meta, StoryObj } from '@storybook/react';
import { Search, X } from 'lucide-react';

import { Input } from './Input';

const meta: Meta<typeof Input> = {
  title: 'UI/Input',
  component: Input,
  args: {
    placeholder: 'Type something…'
  }
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {};

export const WithLeftIcon: Story = {
  args: {
    leftIcon: <Search />,
    placeholder: 'Search…'
  }
};

export const WithRightIcon: Story = {
  args: {
    rightIcon: <X />,
    placeholder: 'With clear button'
  }
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Input size="sm" placeholder="Small" />
      <Input size="md" placeholder="Medium" />
      <Input size="lg" placeholder="Large" />
    </div>
  )
};

export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: 'Disabled input'
  }
};
