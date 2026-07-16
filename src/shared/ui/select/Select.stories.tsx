import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import type { FC } from 'react';

import { Select } from './Select';

const meta: Meta<typeof Select> = {
  title: 'UI/Select',
  component: Select
};

export default meta;
type Story = StoryObj<typeof Select>;

const branchOptions = [
  { value: 'main', label: 'main' },
  { value: 'develop', label: 'develop' },
  { value: 'feat/auth', label: 'feat/auth' },
  { value: 'fix/login', label: 'fix/login' },
  { value: 'archived', label: 'archived', disabled: true }
];

const ControlledDemo: FC = () => {
  const [value, setValue] = useState<string | null>(null);
  return (
    <div className="flex flex-col gap-2">
      <Select
        options={branchOptions}
        value={value ?? undefined}
        placeholder="Select branch"
        onValueChange={(next) => setValue(next)}
      />
      <span className="text-xs text-muted-foreground">Current: {value ?? 'none'}</span>
    </div>
  );
};

export const Default: Story = {
  args: {
    options: branchOptions,
    placeholder: 'Select branch'
  }
};

export const WithDefault: Story = {
  args: {
    options: branchOptions,
    defaultValue: 'main'
  }
};

export const Controlled: Story = {
  render: () => <ControlledDemo />
};

export const Disabled: Story = {
  args: {
    options: branchOptions,
    disabled: true,
    placeholder: 'Disabled select'
  }
};
