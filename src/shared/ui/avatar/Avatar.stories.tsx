import type { Meta, StoryObj } from '@storybook/react';

import { AvatarFallback, AvatarImage, AvatarRoot } from './Avatar';

const meta: Meta<typeof AvatarRoot> = {
  title: 'shared/Avatar',
  component: AvatarRoot,
  args: {
    size: 'md'
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg']
    }
  }
};

export default meta;

type Story = StoryObj<typeof AvatarRoot>;

export const WithImage: Story = {
  render: (args) => (
    <AvatarRoot size={args.size}>
      <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
      <AvatarFallback>SH</AvatarFallback>
    </AvatarRoot>
  )
};

export const WithFallback: Story = {
  render: (args) => (
    <AvatarRoot size={args.size}>
      <AvatarFallback delay={0}>GP</AvatarFallback>
    </AvatarRoot>
  )
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-4">
      <AvatarRoot size="sm">
        <AvatarFallback>SM</AvatarFallback>
      </AvatarRoot>
      <AvatarRoot size="md">
        <AvatarFallback>MD</AvatarFallback>
      </AvatarRoot>
      <AvatarRoot size="lg">
        <AvatarFallback>LG</AvatarFallback>
      </AvatarRoot>
    </div>
  )
};
