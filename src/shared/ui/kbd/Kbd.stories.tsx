import type { Meta, StoryObj } from '@storybook/react';

import { Kbd } from './Kbd';

const meta: Meta<typeof Kbd> = {
  title: 'UI/Kbd',
  component: Kbd
};

export default meta;

type Story = StoryObj<typeof Kbd>;

export const Single: Story = {
  args: {
    children: '⌘'
  }
};

export const Combo: Story = {
  render: () => <Kbd keys={['⌘', 'Shift', 'P']} />
};

export const Shortcuts: Story = {
  render: () => (
    <ul className="text-foreground space-y-2 text-sm">
      <li className="flex items-center justify-between gap-8">
        <span>Open command palette</span>
        <Kbd keys={['⌘', 'Shift', 'P']} />
      </li>
      <li className="flex items-center justify-between gap-8">
        <span>Clone repository</span>
        <Kbd keys={['⌘', 'O']} />
      </li>
      <li className="flex items-center justify-between gap-8">
        <span>Commit changes</span>
        <Kbd keys={['⌘', 'Enter']} />
      </li>
      <li className="flex items-center justify-between gap-8">
        <span>Push</span>
        <Kbd keys={['⌘', 'Shift', 'K']} />
      </li>
    </ul>
  )
};

export const Standalone: Story = {
  render: () => (
    <div className="text-foreground flex items-center gap-2 text-sm">
      Press <Kbd>Esc</Kbd> to dismiss
    </div>
  )
};
