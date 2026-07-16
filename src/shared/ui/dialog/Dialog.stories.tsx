import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import type { FC } from 'react';

import { Button } from '@/shared/ui/button';

import { Dialog } from './Dialog';

const meta: Meta<typeof Dialog.Root> = {
  title: 'UI/Dialog',
  component: Dialog.Root
};

export default meta;
type Story = StoryObj<typeof Dialog.Root>;

const DefaultDemo: FC = () => (
  <Dialog.Root>
    <Dialog.Trigger>
      <Button>Open dialog</Button>
    </Dialog.Trigger>
    <Dialog.Portal>
      <Dialog.Backdrop />
      <Dialog.Content
        title="Are you absolutely sure?"
        description="This action cannot be undone."
      >
        <p className="text-sm text-muted-foreground">
          The file will be permanently removed from your workspace.
        </p>
        <div className="flex justify-end gap-2 pt-2">
          <Dialog.Close>
            <Button variant="ghost">Cancel</Button>
          </Dialog.Close>
          <Dialog.Close>
            <Button variant="destructive">Confirm</Button>
          </Dialog.Close>
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
);

const ControlledDemo: FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={(next) => setOpen(next)}>
      <Dialog.Trigger>
        <Button variant="secondary">Controlled dialog</Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Content title="Controlled" description="State managed by parent.">
          <Button onClick={() => setOpen(false)}>Close</Button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export const Default: Story = {
  render: () => <DefaultDemo />
};

export const Controlled: Story = {
  render: () => <ControlledDemo />
};
