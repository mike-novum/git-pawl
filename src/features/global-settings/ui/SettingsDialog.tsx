import type { FC } from 'react';
import { useCallback } from 'react';

import { Dialog } from '@/shared/ui';

import type { SettingsDialogProps } from './types';
import { SettingsForm } from './SettingsForm';

export const SettingsDialog: FC<SettingsDialogProps> = ({
  open,
  onOpenChange
}) => {
  const handleOpenChange = useCallback(
    (next: boolean) => {
      onOpenChange(next);
    },
    [onOpenChange]
  );

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Content
          title="Settings"
          description="Global preferences for git-pawl. Saved locally and applied to all repositories."
        >
          <SettingsForm onSuccess={() => onOpenChange(false)} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

SettingsDialog.displayName = 'SettingsDialog';