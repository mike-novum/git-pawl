import type { Meta, StoryObj } from '@storybook/react';
import type { FC } from 'react';

import { Skeleton } from './Skeleton';

type CardSkeletonProps = {
  lines: number;
};

const CardSkeleton: FC<CardSkeletonProps> = ({ lines }) => (
  <div className="bg-card text-card-foreground w-80 space-y-3 rounded-lg border p-6">
    <Skeleton className="h-5 w-1/2" />
    <Skeleton className="h-3 w-full" />
    <Skeleton className="h-3 w-5/6" />
    {Array.from({ length: Math.max(0, lines - 3) }, (_, i) => (
      <Skeleton key={i} className="h-3 w-full" />
    ))}
  </div>
);

const meta: Meta<typeof CardSkeleton> = {
  title: 'UI/Skeleton',
  component: CardSkeleton,
  args: {
    lines: 3
  },
  argTypes: {
    lines: { control: { type: 'number', min: 1, max: 12 } }
  }
};

export default meta;

type Story = StoryObj<typeof CardSkeleton>;

export const CardLoading: Story = {};

export const AvatarLine: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  )
};
