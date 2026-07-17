import { useState } from 'react';
import type { FC } from 'react';
import {
  Archive,
  ArrowDownToLine,
  ChevronDown,
  Layers,
  Trash2
} from 'lucide-react';

import { Button, Dialog, Input, useToast } from '@/shared/ui';
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuPositioner,
  DropdownMenuRoot,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/shared/ui/dropdown-menu';

import {
  useStashApply,
  useStashDrop,
  useStashPop,
  useStashPush
} from '../model';

import type { StashControlsProps } from './types';

const TOAST_MESSAGES = {
  push: {
    success: { title: 'Stash pushed', description: 'Working tree changes saved to stash' },
    error: { title: 'Stash push failed' }
  },
  pop: {
    success: { title: 'Stash popped', description: 'Latest stash applied and removed' },
    error: { title: 'Stash pop failed' }
  },
  apply: {
    success: { title: 'Stash applied', description: 'Latest stash applied to working tree' },
    error: { title: 'Stash apply failed' }
  },
  drop: {
    success: { title: 'Stash dropped', description: 'Latest stash dropped' },
    error: { title: 'Stash drop failed' }
  }
} as const;

export const StashControls: FC<StashControlsProps> = ({
  repoPath,
  ref,
  disabled = false,
  className
}) => {
  const toast = useToast();
  const [pushOpen, setPushOpen] = useState(false);
  const [message, setMessage] = useState('');

  const { mutate: mutatePush, isPending: isPushPending } = useStashPush();
  const { mutate: mutatePop, isPending: isPopPending } = useStashPop();
  const { mutate: mutateApply, isPending: isApplyPending } = useStashApply();
  const { mutate: mutateDrop, isPending: isDropPending } = useStashDrop();

  const anyPending =
    isPushPending || isPopPending || isApplyPending || isDropPending;
  const isDisabled = disabled || !repoPath || anyPending;

  const handlePush = (): void => {
    if (!repoPath || isPushPending) return;
    const trimmed = message.trim();
    mutatePush(
      { repoPath, ...(trimmed ? { message: trimmed } : {}) },
      {
        onSuccess: () => {
          toast.success(TOAST_MESSAGES.push.success);
          setMessage('');
          setPushOpen(false);
        },
        onError: (err) => {
          toast.error({
            ...TOAST_MESSAGES.push.error,
            description: err.message
          });
        }
      }
    );
  };

  const handlePop = (): void => {
    if (!repoPath || isPopPending) return;
    mutatePop(
      { repoPath, ...(ref ? { ref } : {}) },
      {
        onSuccess: () => toast.success(TOAST_MESSAGES.pop.success),
        onError: (err) =>
          toast.error({
            ...TOAST_MESSAGES.pop.error,
            description: err.message
          })
      }
    );
  };

  const handleApply = (): void => {
    if (!repoPath || isApplyPending) return;
    mutateApply(
      { repoPath, ...(ref ? { ref } : {}) },
      {
        onSuccess: () => toast.success(TOAST_MESSAGES.apply.success),
        onError: (err) =>
          toast.error({
            ...TOAST_MESSAGES.apply.error,
            description: err.message
          })
      }
    );
  };

  const handleDrop = (): void => {
    if (!repoPath || isDropPending) return;
    mutateDrop(
      { repoPath, ...(ref ? { ref } : {}) },
      {
        onSuccess: () => toast.success(TOAST_MESSAGES.drop.success),
        onError: (err) =>
          toast.error({
            ...TOAST_MESSAGES.drop.error,
            description: err.message
          })
      }
    );
  };

  const handlePushDialogChange = (next: boolean): void => {
    setPushOpen(next);
    if (!next) setMessage('');
  };

  return (
    <>
      <DropdownMenuRoot>
        <DropdownMenuTrigger
          aria-label="Stash actions"
          disabled={isDisabled}
          className={className}
        >
          <span className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-sm">
            <Archive aria-hidden="true" className="size-4" />
            <span>Stash</span>
            <ChevronDown
              aria-hidden="true"
              className="text-muted-foreground size-4"
            />
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuPositioner sideOffset={6} align="end">
            <DropdownMenuContent className="min-w-48">
              <DropdownMenuItem
                disabled={isDisabled}
                onClick={() => setPushOpen(true)}
              >
                <ArrowDownToLine
                  aria-hidden="true"
                  className="text-muted-foreground size-4"
                />
                Push
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                disabled={isDisabled}
                onClick={handlePop}
              >
                <Layers
                  aria-hidden="true"
                  className="text-muted-foreground size-4"
                />
                Pop
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={isDisabled}
                onClick={handleApply}
              >
                <Archive
                  aria-hidden="true"
                  className="text-muted-foreground size-4"
                />
                Apply
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={isDisabled}
                onClick={handleDrop}
              >
                <Trash2
                  aria-hidden="true"
                  className="text-muted-foreground size-4"
                />
                Drop
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenuPositioner>
        </DropdownMenuPortal>
      </DropdownMenuRoot>

      <Dialog.Root open={pushOpen} onOpenChange={handlePushDialogChange}>
        <Dialog.Portal>
          <Dialog.Backdrop />
          <Dialog.Content
            title="Push to stash"
            description="Optionally add a message to describe what is being stashed."
          >
            <form
              className="flex flex-col gap-3"
              onSubmit={(event) => {
                event.preventDefault();
                handlePush();
              }}
            >
              <Input
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Stash message (optional)"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => handlePushDialogChange(false)}
                  disabled={isPushPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  loading={isPushPending}
                >
                  Push
                </Button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
};

StashControls.displayName = 'StashControls';