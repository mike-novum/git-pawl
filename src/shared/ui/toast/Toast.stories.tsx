import type { Meta, StoryObj } from '@storybook/react';
import type { FC } from 'react';

import { Button } from '@/shared/ui/button';

import { Toast } from './Toast';
import { useToast } from './ToastProvider';

const meta: Meta<typeof Toast.Provider> = {
  title: 'UI/Toast',
  component: Toast.Provider,
  decorators: [
    (StoryComponent) => (
      <Toast.Provider>
        <StoryComponent />
        <Toast.Portal>
          <Toast.Viewport />
          <Toast.List />
        </Toast.Portal>
      </Toast.Provider>
    )
  ]
};

export default meta;
type Story = StoryObj<typeof Toast.Provider>;

const Demo: FC = () => {
  const toast = useToast();

  return (
    <div className="flex flex-wrap gap-2">
      <Button onClick={() => toast.show({ title: 'Heads up', description: 'Something happened.' })}>
        Show toast
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          toast.success({ title: 'Saved', description: 'Your changes have been saved.' })
        }
      >
        Success
      </Button>
      <Button
        variant="destructive"
        onClick={() => toast.error({ title: 'Error', description: 'Something failed.' })}
      >
        Error
      </Button>
      <Button
        variant="ghost"
        onClick={() => toast.info({ title: 'Info', description: 'Just letting you know.' })}
      >
        Info
      </Button>
    </div>
  );
};

const NonAutoDemo: FC = () => {
  const toast = useToast();

  return (
    <Button
      onClick={() =>
        toast.show({
          title: 'Manual close',
          description: 'Click X to dismiss.',
          timeout: 0
        })
      }
    >
      Open non-auto toast
    </Button>
  );
};

export const Default: Story = {
  render: () => <Demo />
};

export const WithClose: Story = {
  render: () => <NonAutoDemo />
};
