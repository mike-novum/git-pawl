import { useState } from 'react';
import type { FC } from 'react';
import { History } from 'lucide-react';

import { Button, Command, Dialog, Spinner, useToast } from '@/shared/ui';
import { useCommitList } from '@/entities/commit';

import { useRevert } from '../model';

import type { RevertControlsProps } from './types';

const TOAST_MESSAGES = {
  success: { title: 'Revert complete', description: 'A new revert commit was created' },
  error: { title: 'Revert failed' },
  conflict: { title: 'Revert conflicts', description: 'Resolve conflicts before continuing' },
  confirm: {
    title: 'Revert commit?',
    description: 'This will create a new commit that undoes the selected changes.'
  }
} as const;

const SHORT_HASH_LENGTH = 7;

const detectConflict = (message: string): boolean =>
  message.toLowerCase().includes('conflict');

const CommitPicker: FC<{
  repoPath: string;
  selectedHash: string;
  onSelect: (hash: string) => void;
  disabled?: boolean;
}> = ({ repoPath, selectedHash, onSelect, disabled = false }) => {
  const commitsQuery = useCommitList(repoPath, { maxCount: 50 });
  const commits = commitsQuery.data ?? [];

  if (commitsQuery.isLoading) {
    return (
      <div
        className="text-muted-foreground inline-flex items-center gap-2 text-sm"
        aria-live="polite"
      >
        <Spinner size="sm" label="Loading commits" />
        Loading commits…
      </div>
    );
  }

  if (commits.length === 0) {
    return <p className="text-muted-foreground text-sm">No commits available.</p>;
  }

  return (
    <Command.Root
      className="bg-card border-border max-h-72 overflow-hidden rounded-md border"
      label="Pick a commit to revert"
    >
      <Command.Input placeholder="Search commits…" />
      <Command.List>
        <Command.Empty>No commits found.</Command.Empty>
        {commits.map((commit) => {
          const shortHash =
            commit.hash.length > SHORT_HASH_LENGTH
              ? commit.hash.slice(0, SHORT_HASH_LENGTH)
              : commit.hash;
          const isSelected = commit.hash === selectedHash;

          return (
            <Command.Item
              key={commit.hash}
              value={`${shortHash} ${commit.subject} ${commit.author.name}`}
              onSelect={() => onSelect(commit.hash)}
              disabled={disabled}
              data-selected={isSelected || undefined}
              className="flex flex-col items-start gap-0.5"
            >
              <span className="flex items-center gap-2">
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground/80">
                  {shortHash}
                </code>
                <span className="text-sm font-medium">{commit.subject}</span>
              </span>
              <span className="text-muted-foreground text-xs">
                {commit.author.name} · {new Date(commit.date).toLocaleString()}
              </span>
            </Command.Item>
          );
        })}
      </Command.List>
    </Command.Root>
  );
};

export const RevertControls: FC<RevertControlsProps> = ({
  repoPath,
  disabled = false,
  className
}) => {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedHash, setSelectedHash] = useState('');
  const [noEdit, setNoEdit] = useState(true);

  const { mutate, isPending } = useRevert();

  const isDisabled = disabled || !repoPath || isPending;

  const closeDialog = (): void => {
    if (isPending) return;
    setOpen(false);
    setSelectedHash('');
    setNoEdit(true);
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

  const runRevert = (hash: string): void => {
    if (!repoPath || isPending || !hash) return;
    mutate(
      {
        repoPath,
        commit: hash,
        ...(noEdit ? { noEdit } : {})
      },
      {
        onSuccess: () => {
          toast.success(TOAST_MESSAGES.success);
          closeDialog();
        },
        onError: (err) => {
          if (detectConflict(err.message)) {
            toast.error({
              ...TOAST_MESSAGES.conflict,
              description: err.message
            });
          } else {
            toast.error({
              ...TOAST_MESSAGES.error,
              description: err.message
            });
          }
        }
      }
    );
  };

  const handleSubmit = (): void => {
    if (!selectedHash) return;
    setConfirmOpen(true);
  };

  const handleConfirmRevert = (): void => {
    if (!selectedHash) return;
    setConfirmOpen(false);
    runRevert(selectedHash);
  };

  return (
    <>
      <Dialog.Root open={open} onOpenChange={handleOpenChange}>
        <Dialog.Portal>
          <Dialog.Backdrop />
          <Dialog.Content
            title="Revert commit"
            description="Pick a commit and apply its inverse as a new commit."
          >
            <div className="flex flex-col gap-4">
              <CommitPicker
                repoPath={repoPath}
                selectedHash={selectedHash}
                onSelect={setSelectedHash}
                disabled={isPending}
              />
              <label className="text-foreground inline-flex items-center gap-2 text-sm select-none">
                <input
                  type="checkbox"
                  checked={noEdit}
                  onChange={(event) => setNoEdit(event.target.checked)}
                  disabled={isPending}
                  className="size-4 accent-primary"
                />
                <span>Use default revert message (--no-edit)</span>
              </label>
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
                  type="button"
                  variant="primary"
                  onClick={handleSubmit}
                  disabled={isPending || !selectedHash}
                >
                  Revert…
                </Button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root open={confirmOpen} onOpenChange={handleConfirmClose}>
        <Dialog.Portal>
          <Dialog.Backdrop />
          <Dialog.Content
            title={TOAST_MESSAGES.confirm.title}
            description={TOAST_MESSAGES.confirm.description}
          >
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
                onClick={handleConfirmRevert}
                loading={isPending}
              >
                Revert commit
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
        leftIcon={<History aria-hidden="true" className="size-4" />}
        className={className}
      >
        Revert
      </Button>
    </>
  );
};

RevertControls.displayName = 'RevertControls';
