import type { FC } from 'react';

import { Dialog } from '@/shared/ui';

import { ConnectAccountForm } from './ConnectAccountForm';
import type { ConnectAccountDialogProps } from './types';

export const ConnectAccountDialog: FC<ConnectAccountDialogProps> = ({
  open,
  onOpenChange
}) => (
  <Dialog.Root open={open} onOpenChange={onOpenChange}>
    <Dialog.Portal>
      <Dialog.Backdrop />
      <Dialog.Content
        title="Connect account"
        description="Authenticate against GitHub or GitLab using a personal access token."
      >
        <ConnectAccountForm onSuccess={() => onOpenChange(false)} />
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
);

ConnectAccountDialog.displayName = 'ConnectAccountDialog';
