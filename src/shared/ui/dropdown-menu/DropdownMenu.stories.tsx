import type { Meta, StoryObj } from '@storybook/react';
import type { FC } from 'react';

import {
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuPositioner,
  DropdownMenuRoot,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from './DropdownMenu';

type TriggerStoryProps = {
  label: string;
};

const Template: FC<TriggerStoryProps> = ({ label }) => (
  <DropdownMenuRoot>
    <DropdownMenuTrigger className="bg-primary text-primary-foreground rounded-md px-3 py-1.5 text-sm">
      {label}
    </DropdownMenuTrigger>
    <DropdownMenuPortal>
      <DropdownMenuPositioner sideOffset={6}>
        <DropdownMenuContent>
          <DropdownMenuGroup>
            <DropdownMenuLabel>Repository</DropdownMenuLabel>
            <DropdownMenuItem>Open</DropdownMenuItem>
            <DropdownMenuItem>Clone</DropdownMenuItem>
            <DropdownMenuItem>Refresh</DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuLabel>Danger zone</DropdownMenuLabel>
            <DropdownMenuItem disabled>Rename</DropdownMenuItem>
            <DropdownMenuItem>Delete</DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenuPositioner>
    </DropdownMenuPortal>
  </DropdownMenuRoot>
);

const meta: Meta<typeof Template> = {
  title: 'shared/DropdownMenu',
  component: Template,
  args: {
    label: 'Open menu'
  }
};

export default meta;

type Story = StoryObj<typeof Template>;

export const Default: Story = {};

export const WithDisabledItems: Story = {
  args: { label: 'Menu (some disabled)' },
  render: (args) => (
    <DropdownMenuRoot>
      <DropdownMenuTrigger className="bg-muted text-foreground rounded-md px-3 py-1.5 text-sm">
        {args.label}
      </DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuPositioner sideOffset={6}>
          <DropdownMenuContent>
            <DropdownMenuItem>Available</DropdownMenuItem>
            <DropdownMenuItem disabled>Unavailable</DropdownMenuItem>
            <DropdownMenuItem>Available</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenuPositioner>
      </DropdownMenuPortal>
    </DropdownMenuRoot>
  )
};
