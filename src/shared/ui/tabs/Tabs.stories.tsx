import type { Meta, StoryObj } from '@storybook/react';

import { Tabs } from './Tabs';

const meta: Meta<typeof Tabs.Root> = {
  title: 'UI/Tabs',
  component: Tabs.Root
};

export default meta;
type Story = StoryObj<typeof Tabs.Root>;

export const Default: Story = {
  render: () => (
    <Tabs.Root defaultValue="overview">
      <Tabs.List>
        <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
        <Tabs.Trigger value="commits">Commits</Tabs.Trigger>
        <Tabs.Trigger value="branches">Branches</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="overview">Overview content.</Tabs.Content>
      <Tabs.Content value="commits">Commits content.</Tabs.Content>
      <Tabs.Content value="branches">Branches content.</Tabs.Content>
    </Tabs.Root>
  )
};

export const DisabledTab: Story = {
  render: () => (
    <Tabs.Root defaultValue="available">
      <Tabs.List>
        <Tabs.Trigger value="available">Available</Tabs.Trigger>
        <Tabs.Trigger value="disabled" disabled>
          Disabled
        </Tabs.Trigger>
        <Tabs.Trigger value="other">Other</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="available">Available tab content.</Tabs.Content>
      <Tabs.Content value="other">Other tab content.</Tabs.Content>
    </Tabs.Root>
  )
};
