import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import type { FC } from 'react';

import { Checkbox } from './Checkbox';

const meta: Meta<typeof Checkbox> = {
  title: 'UI/Checkbox',
  component: Checkbox
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {
  args: {
    label: 'Accept terms and conditions'
  }
};

export const Checked: Story = {
  args: {
    label: 'Checked by default',
    defaultChecked: true
  }
};

export const Indeterminate: Story = {
  args: {
    label: 'Indeterminate',
    defaultChecked: false,
    indeterminate: true
  }
};

const ControlledDemo: FC = () => {
  const [value, setValue] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <Checkbox
        label={`Controlled (${value ? 'checked' : 'unchecked'})`}
        checked={value}
        onCheckedChange={(checked) => setValue(checked)}
      />
      <button
        type="button"
        className="self-start text-sm text-primary underline"
        onClick={() => setValue((v) => !v)}
      >
        Toggle externally
      </button>
    </div>
  );
};

export const Controlled: Story = {
  render: () => <ControlledDemo />
};

export const Disabled: Story = {
  args: {
    label: 'Disabled',
    disabled: true
  }
};
