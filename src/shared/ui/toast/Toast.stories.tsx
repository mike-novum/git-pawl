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

const VariantPreview: FC<{
  title: string;
  description: string;
  type: 'default' | 'success' | 'error' | 'info';
}> = ({ title, description, type }) => (
  <Toast.Root toast={{ id: title, title, description, type }}>
    <Toast.Content>
      <Toast.Title>{title}</Toast.Title>
      <Toast.Description>{description}</Toast.Description>
    </Toast.Content>
    <Toast.Close />
  </Toast.Root>
);

const VariantsPreview: FC = () => (
  <div className="flex w-[360px] flex-col gap-2">
    <VariantPreview title="Heads up" description="Something happened." type="default" />
    <VariantPreview title="Saved" description="Your changes have been saved." type="success" />
    <VariantPreview title="Error" description="Something failed." type="error" />
    <VariantPreview title="Info" description="Just letting you know." type="info" />
  </div>
);

export const Variants: Story = {
  render: () => <VariantsPreview />
};
