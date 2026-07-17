import { useState } from 'react';
import type { FC } from 'react';
import { Undo2 } from 'lucide-react';

import { Button, Dialog, Input, Select, useToast } from '@/shared/ui';

import { useReset, type GitResetMode } from '../model';

import type { ResetControlsProps } from './types';

const MODE_OPTIONS = [
  { value: 'soft', label: 'Soft — keep changes staged' },
  { value: 'mixed', label: 'Mixed — keep changes unstaged' },
  { value: 'hard', label: 'Hard — discard all changes' }
] as const;

const TOAST_MESSAGES = {
  success: { title: 'Reset complete', description: 'HEAD moved to the selected ref' },
  error: { title: 'Reset failed' },
  confirm: {
    title: 'Reset working tree?',
    description:
      'Hard reset discards all working tree and index changes. This cannot be undone.'
  }
} as const;

export const ResetControls: FC<ResetControlsProps> = ({
  repoPath,
  disabled = false,
  className
}) => {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [mode, setMode] = useState<GitResetMode>('mixed');
  const [ref, setRef] = useState('');

  const { mutate, isPending } = useReset();

  const isDisabled = disabled || !repoPath || isPending;

  const closeDialog = (): void => {
    if (isPending) return;
    setOpen(false);
    setRef('');
    setMode('mixed');
  };

  const handleOpenChange = (next: boolean): void => {
    if (!next) {
      closeDialog();
      return;
    }
    setOpen(true);
  };

  const handleConfirmClose = (next: boolean): void => {
    if (!next && !isPending) {
      setConfirmOpen(false);
    }
  };

  const handleSubmit = (event?: { preventDefault?: () => void }): void => {
    event?.preventDefault?.();
    if (!repoPath || isPending) return;

    const trimmedRef = ref.trim();

    if (mode === 'hard') {
      setConfirmOpen(true);
      return;
    }

    runReset(trimmedRef);
  };

  const runReset = (trimmedRef: string): void => {
    if (!repoPath || isPending) return;
    mutate(
      {
        repoPath,
        mode,
        ...(trimmedRef ? { ref: trimmedRef } : {})
      },
      {
        onSuccess: () => {
          toast.success(TOAST_MESSAGES.success);
          closeDialog();
        },
        onError: (err) =>
          toast.error({
            ...TOAST_MESSAGES.error,
            description: err.message
          })
      }
    );
  };

  const handleConfirmReset = (): void => {
    setConfirmOpen(false);
    runReset(ref.trim());
  };

  return (
    <>
      <Dialog.Root open={open} onOpenChange={handleOpenChange}>
        <Dialog.Portal>
          <Dialog.Backdrop />
          <Dialog.Content
            title="Reset HEAD"
            description="Pick a reset mode and an optional target ref. Leave ref empty to reset the latest commit."
          >
            <form
              className="flex flex-col gap-4"
              onSubmit={handleSubmit}
            >
              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-foreground">Mode</span>
                <Select
                  options={MODE_OPTIONS.map((option) => ({
                    value: option.value,
                    label: option.label
                  }))}
                  value={mode}
                  onValueChange={(next) => {
                    if (next === 'soft' || next === 'mixed' || next === 'hard') {
                      setMode(next);
                    }
                  }}
                  placeholder="Select mode"
                  disabled={isPending}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-foreground">Ref</span>
                <Input
                  value={ref}
                  onChange={(event) => setRef(event.target.value)}
                  placeholder="HEAD~1, branch, sha (optional)"
                  disabled={isPending}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={closeDialog}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant={mode === 'hard' ? 'destructive' : 'primary'}
                  loading={isPending}
                >
                  Reset
                </Button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root open={confirmOpen} onOpenChange={handleConfirmClose}>
        <Dialog.Portal>
          <Dialog.Backdrop />
          <Dialog.Content title={TOAST_MESSAGES.confirm.title} description={TOAST_MESSAGES.confirm.description}>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setConfirmOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleConfirmReset}
                loading={isPending}
              >
                Discard changes
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Button
        type="button"
        variant="secondary"
        onClick={() => setOpen(true)}
        disabled={isDisabled}
        leftIcon={<Undo2 aria-hidden="true" className="size-4" />}
        className={className}
      >
        Reset
      </Button>
    </>
  );
};

ResetControls.displayName = 'ResetControls';
