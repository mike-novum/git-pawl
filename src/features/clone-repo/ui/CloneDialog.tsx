import type { FC } from 'react';

import { Dialog } from '@/shared/ui';

import { CloneByUrlForm } from './CloneByUrlForm';
import type { CloneDialogProps } from './types';

export const CloneDialog: FC<CloneDialogProps> = ({
  open,
  onOpenChange,
  activeWorkspace
}) => (
  <Dialog.Root open={open} onOpenChange={onOpenChange}>
    <Dialog.Portal>
      <Dialog.Backdrop />
      <Dialog.Content
        title="Clone repository"
        description="Paste a public repository URL. The destination folder defaults to the active workspace."
      >
        <CloneByUrlForm
          activeWorkspace={activeWorkspace}
          onSuccess={() => onOpenChange(false)}
        />
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
);

CloneDialog.displayName = 'CloneDialog';