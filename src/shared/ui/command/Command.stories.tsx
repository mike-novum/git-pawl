import type { Meta, StoryObj } from '@storybook/react';

import { Command } from './Command';

const meta = {
  title: 'UI/Command',
  component: Command.Root
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="border-border w-[420px] rounded-md border">
      <Command.Root>
        <Command.Input />
        <Command.List>
          <Command.Empty>No results found.</Command.Empty>
          <Command.Group heading="Suggestions">
            <Command.Item>Calendar</Command.Item>
            <Command.Item>Search</Command.Item>
            <Command.Item>Settings</Command.Item>
          </Command.Group>
          <Command.Separator />
          <Command.Group heading="Git">
            <Command.Item>git status</Command.Item>
            <Command.Item>git log</Command.Item>
            <Command.Item>git diff</Command.Item>
            <Command.Item>git stash</Command.Item>
          </Command.Group>
        </Command.List>
      </Command.Root>
    </div>
  )
};

export const InDialog: Story = {
  render: () => (
    <Command.Dialog open>
      <Command.Input />
      <Command.List>
        <Command.Empty>No results found.</Command.Empty>
        <Command.Group heading="Quick actions">
          <Command.Item value="clone">Clone repository…</Command.Item>
          <Command.Item value="open">Open repository…</Command.Item>
          <Command.Item value="settings">Open settings</Command.Item>
          <Command.Item value="theme">Toggle theme</Command.Item>
        </Command.Group>
        <Command.Separator />
        <Command.Group heading="Branches">
          <Command.Item value="main">main</Command.Item>
          <Command.Item value="develop">develop</Command.Item>
          <Command.Item value="feature/auth">feature/auth</Command.Item>
        </Command.Group>
      </Command.List>
    </Command.Dialog>
  )
};
