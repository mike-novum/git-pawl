import type { Meta, StoryObj } from '@storybook/react';

import { computeLayout } from '../lib/computeLayout';
import { RepoGraph } from './RepoGraph';
import type { CommitNode } from '../types';

const sampleCommits: CommitNode[] = [
  {
    hash: 'c39473d9b5f8a1e0d4c2b6a8f3e7d1c5b9a4e2f0',
    shortHash: 'c39473d',
    subject: 'docs(tasks): отметить TASK-300..304 как выполненные',
    author: 'mikenovum',
    timestamp: Date.now() - 1000 * 60 * 30,
    parents: ['7108d87a3b1c9d8e7f4a2b6c8d0e1f3a5b7c9d2e'],
    lane: 0,
    isCurrentBranch: true
  },
  {
    hash: '7108d87a3b1c9d8e7f4a2b6c8d0e1f3a5b7c9d2e',
    shortHash: '7108d87',
    subject: 'merge: TASK-304 (reviewed APPROVED with non-blocking follow-ups)',
    author: 'mikenovum',
    timestamp: Date.now() - 1000 * 60 * 60 * 2,
    parents: ['0c84b19a2d4e6f8b0c1d3e5f7a9b1c3d5e7f9a1b', 'f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0'],
    lane: 0,
    branches: ['main']
  },
  {
    hash: 'f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0',
    shortHash: 'f1a2b3c',
    subject: 'feat(graph): improve CommitRow node styling',
    author: 'mikenovum',
    timestamp: Date.now() - 1000 * 60 * 60 * 3,
    parents: ['0c84b19a2d4e6f8b0c1d3e5f7a9b1c3d5e7f9a1b'],
    lane: 1,
    branches: ['feat/graph-redesign'],
    tags: ['v0.4.0-rc1']
  },
  {
    hash: '0c84b19a2d4e6f8b0c1d3e5f7a9b1c3d5e7f9a1b',
    shortHash: '0c84b19',
    subject: 'merge: TASK-303 (reviewed APPROVED)',
    author: 'mikenovum',
    timestamp: Date.now() - 1000 * 60 * 60 * 5,
    parents: ['ad59b5c1d3e5f7a9b1c3d5e7f9a1b3c5d7e9f1a3', 'a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1'],
    lane: 0
  },
  {
    hash: 'a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1',
    shortHash: 'a2b3c4d',
    subject: 'refactor(drawer): remove artifact border on settings panel',
    author: 'mikenovum',
    timestamp: Date.now() - 1000 * 60 * 60 * 7,
    parents: ['ad59b5c1d3e5f7a9b1c3d5e7f9a1b3c5d7e9f1a3'],
    lane: 1
  },
  {
    hash: 'ad59b5c1d3e5f7a9b1c3d5e7f9a1b3c5d7e9f1a3',
    shortHash: 'ad59b5c',
    subject: 'merge: TASK-302 (reviewed APPROVED)',
    author: 'mikenovum',
    timestamp: Date.now() - 1000 * 60 * 60 * 9,
    parents: ['1f51c74a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e', 'b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2'],
    lane: 0
  },
  {
    hash: 'b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2',
    shortHash: 'b3c4d5e',
    subject: 'feat(workspace): move path and counters to header',
    author: 'mikenovum',
    timestamp: Date.now() - 1000 * 60 * 60 * 11,
    parents: ['1f51c74a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e'],
    lane: 1
  },
  {
    hash: '1f51c74a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e',
    shortHash: '1f51c74',
    subject: 'merge: TASK-301 (reviewed APPROVED)',
    author: 'mikenovum',
    timestamp: Date.now() - 1000 * 60 * 60 * 13,
    parents: ['c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3'],
    lane: 0
  },
  {
    hash: 'c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3',
    shortHash: 'c4d5e6f',
    subject: 'feat(hero): add shimmer-skeleton for counters',
    author: 'mikenovum',
    timestamp: Date.now() - 1000 * 60 * 60 * 15,
    parents: ['d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4'],
    lane: 0
  },
  {
    hash: 'd5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4',
    shortHash: 'd5e6f7a',
    subject: 'fix(tile): remove artifact near repository counter',
    author: 'mikenovum',
    timestamp: Date.now() - 1000 * 60 * 60 * 20,
    parents: [],
    lane: 0
  }
];

const meta: Meta<typeof RepoGraph> = {
  title: 'widgets/RepoGraph',
  component: RepoGraph,
  decorators: [
    (Story) => (
      <div className="bg-background h-screen w-full">
        <Story />
      </div>
    )
  ]
};

export default meta;

type Story = StoryObj<typeof RepoGraph>;

export const Dark: Story = {
  args: {
    commits: sampleCommits,
    layout: computeLayout(sampleCommits),
    selectedHash: '7108d87a3b1c9d8e7f4a2b6c8d0e1f3a5b7c9d2e',
    onSelect: () => {}
  },
  decorators: [
    (Story) => (
      <div data-theme="dark" className="h-full w-full">
        <Story />
      </div>
    )
  ]
};

export const Light: Story = {
  args: {
    commits: sampleCommits,
    layout: computeLayout(sampleCommits),
    selectedHash: '7108d87a3b1c9d8e7f4a2b6c8d0e1f3a5b7c9d2e',
    onSelect: () => {}
  },
  decorators: [
    (Story) => (
      <div data-theme="light" className="h-full w-full">
        <Story />
      </div>
    )
  ]
};

export const Empty: Story = {
  args: {
    commits: [],
    selectedHash: null,
    onSelect: () => {}
  }
};

export const Loading: Story = {
  args: {
    commits: [],
    selectedHash: null,
    onSelect: () => {},
    isLoading: true
  }
};

export const Error: Story = {
  args: {
    commits: [],
    selectedHash: null,
    onSelect: () => {},
    isError: true
  }
};
