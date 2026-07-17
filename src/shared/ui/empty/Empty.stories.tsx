import { GitBranch, GitCommit, Inbox } from 'lucide-react';
import type { Meta, StoryObj } from '@storybook/react';

import { Empty } from './Empty';

const meta = {
  title: 'UI/Empty'
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Repositories: Story = {
  render: () => (
    <Empty
      icon={<GitBranch className="size-6" />}
      title="No repositories yet"
      description="Clone a repository or open an existing one to get started with git-pawl."
      action={
        <button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm">
          Clone repository
        </button>
      }
    />
  )
};

export const Commits: Story = {
  render: () => (
    <Empty
      icon={<GitCommit className="size-6" />}
      title="No commits"
      description="This branch does not have any commits yet."
    />
  )
};

export const Default: Story = {
  render: () => (
    <Empty
      icon={<Inbox className="size-6" />}
      title="Nothing here"
      description="There are no items matching your filters."
    />
  )
};
