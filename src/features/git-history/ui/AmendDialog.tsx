import { useEffect, useState } from 'react';
import type { FC } from 'react';

import { Button, Dialog, useToast } from '@/shared/ui';
import { cn } from '@/shared/lib/theme/cn';

import { useAmend } from '../model';

import type { AmendDialogProps } from './types';

const TOAST_MESSAGES = {
  success: { title: 'Commit amended', description: 'Latest commit was updated' },
  error: { title: 'Amend failed' }
} as const;

const TEXTAREA_CLASSES = cn(
  'border-border bg-background text-foreground placeholder:text-muted-foreground w-full rounded-md border px-3 py-2 text-sm outline-none transition-colors',
  'focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
  'disabled:cursor-not-allowed disabled:opacity-50',
  'resize-y min-h-32'
);

export const AmendDialog: FC<AmendDialogProps> = ({
  repoPath,
  disabled = false,
  className,
  open,
  onOpenChange,
  initialMessage = ''
}) => {
  const toast = useToast();
  const [message, setMessage] = useState(initialMessage);
  const [noVerify, setNoVerify] = useState(false);

  const { mutate, isPending } = useAmend();

  useEffect(() => {
    if (open) {
      setMessage(initialMessage);
      setNoVerify(false);
    }
  }, [open, initialMessage]);

  const isDisabled = disabled || !repoPath || isPending;
  const isInputDisabled = isDisabled;
  const canSubmit = !isPending && message.trim().length > 0;

  const handleOpenChange = (next: boolean): void => {
    if (!next && !isPending) {
      onOpenChange(false);
    }
  };

  const handleSubmit = (event: { preventDefault?: () => void }): void => {
    event?.preventDefault?.();
    if (!repoPath || isPending) return;
    const trimmed = message.trim();
    if (!trimmed) return;
    mutate(
      {
        repoPath,
        message: trimmed,
        ...(noVerify ? { noVerify } : {})
      },
      {
        onSuccess: () => {
          toast.success(TOAST_MESSAGES.success);
          onOpenChange(false);
        },
        onError: (err) =>
          toast.error({
            ...TOAST_MESSAGES.error,
            description: err.message
          })
      }
    );
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Content
          title="Amend last commit"
          description="Edit the latest commit message and update it."
        >
          <form className={cn('flex flex-col gap-4', className)} onSubmit={handleSubmit}>
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-foreground">Message</span>
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="New commit message"
                className={TEXTAREA_CLASSES}
                disabled={isInputDisabled}
                autoFocus
              />
            </div>
            <label className="text-foreground inline-flex items-center gap-2 text-sm select-none">
              <input
                type="checkbox"
                checked={noVerify}
                onChange={(event) => setNoVerify(event.target.checked)}
                disabled={isInputDisabled}
                className="size-4 accent-primary"
              />
              <span>Bypass pre-commit and commit-msg hooks (--no-verify)</span>
            </label>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={!canSubmit}
                loading={isPending}
              >
                Amend
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

AmendDialog.displayName = 'AmendDialog';
