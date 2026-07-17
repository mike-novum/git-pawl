import type { Meta, StoryObj } from '@storybook/react';
import type { FC } from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from './Card';

type CardStoryProps = {
  title: string;
  description: string;
  content: string;
  footer: string;
};

const Template: FC<CardStoryProps> = ({ title, description, content, footer }) => (
  <Card className="w-80">
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent>
      <p>{content}</p>
    </CardContent>
    <CardFooter>
      <p className="text-muted-foreground text-xs">{footer}</p>
    </CardFooter>
  </Card>
);

const meta: Meta<typeof Template> = {
  title: 'shared/Card',
  component: Template,
  args: {
    title: 'Repository',
    description: 'Local clone of git-pawl',
    content: 'A small example of the Card primitive with header, body, and footer slots.',
    footer: 'Updated 2 minutes ago'
  }
};

export default meta;

type Story = StoryObj<typeof Template>;

export const Default: Story = {};

export const Minimal: Story = {
  args: {
    title: 'Quick note',
    description: 'Only header and body',
    content: 'No footer in this variant.',
    footer: ''
  },
  render: (args) => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>{args.title}</CardTitle>
        <CardDescription>{args.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p>{args.content}</p>
      </CardContent>
    </Card>
  )
};

export const Empty: Story = {
  args: {
    title: 'Empty card',
    description: 'No slots filled',
    content: '',
    footer: ''
  },
  render: (args) => <Card className="w-80 p-6">{args.title}</Card>
};
