import type { Meta, StoryObj } from '@storybook/react';

import { Accordion } from './Accordion';

const meta = {
  title: 'UI/Accordion',
  component: Accordion.Root
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Single: Story = {
  render: () => (
    <Accordion.Root defaultValue={['about']} className="border-border w-full rounded-md border">
      <Accordion.Item value="about">
        <Accordion.Header>
          <Accordion.Trigger>About git-pawl</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Panel>
          A native macOS GUI for Git workflows and remote repository management.
        </Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item value="shortcuts">
        <Accordion.Header>
          <Accordion.Trigger>Keyboard shortcuts</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Panel>
          <div className="flex flex-col gap-1">
            <span>Cmd + O — open repository</span>
            <span>Cmd + Shift + P — command palette</span>
            <span>Cmd + K — quick switch</span>
          </div>
        </Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item value="changelog">
        <Accordion.Header>
          <Accordion.Trigger>Changelog</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Panel>Initial release with workspace and repository views.</Accordion.Panel>
      </Accordion.Item>
    </Accordion.Root>
  )
};

export const Multiple: Story = {
  render: () => (
    <Accordion.Root
      defaultValue={['clone', 'push']}
      multiple
      className="border-border w-full rounded-md border"
    >
      <Accordion.Item value="clone">
        <Accordion.Header>
          <Accordion.Trigger>git clone</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Panel>Clone a repository into a new directory.</Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item value="push">
        <Accordion.Header>
          <Accordion.Trigger>git push</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Panel>Update remote refs along with associated objects.</Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item value="pull">
        <Accordion.Header>
          <Accordion.Trigger>git pull</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Panel>Fetch from and integrate with another repository or local branch.</Accordion.Panel>
      </Accordion.Item>
    </Accordion.Root>
  )
};
