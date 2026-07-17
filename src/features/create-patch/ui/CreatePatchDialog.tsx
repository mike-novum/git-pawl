import { useCallback, useMemo, useState } from 'react';
import type { FC } from 'react';
import { FolderInput, GitPullRequestArrow } from 'lucide-react';

import { Button, Command, Dialog, Spinner, useToast } from '@/shared/ui';
import { useCommitList, type Commit } from '@/entities/commit';
import { cn } from '@/shared/lib/theme';

import { useCreatePatch } from '../model';

import type { CommitPickerProps, CreatePatchDialogProps } from './types';

const SHORT_HASH_LENGTH = 12;

const TOAST_MESSAGES = {
  success: { title: 'Patch created' },
  error: { title: 'Patch creation failed' }
} as const;

const CommitPicker: FC<CommitPickerProps> = ({
  commits,
  isLoading,
  selectedHash,
  onSelect,
  disabled = false,
  label
}) => {
  if (isLoading) {
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
      className="bg-card border-border max-h-56 overflow-hidden rounded-md border"
      label={label}
    >
      <Command.Input placeholder="Search commits…" disabled={disabled} />
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

CommitPicker.displayName = 'CommitPicker';

const matchesCommit = (commit: Commit, needle: string): boolean => {
  const lower = needle.toLowerCase();
  return (
    commit.hash.toLowerCase().startsWith(lower) ||
    commit.subject.toLowerCase().includes(lower)
  );
};

const buildRange = (from: string, to: string): string => `${from}..${to}`;

export const CreatePatchDialog: FC<CreatePatchDialogProps> = ({
  open,
  onOpenChange,
  repoPath
}) => {
  const toast = useToast();
  const commitsQuery = useCommitList(repoPath, { maxCount: 50 });
  const commits = useMemo(() => commitsQuery.data ?? [], [commitsQuery.data]);
  const isCommitsLoading = commitsQuery.isLoading && Boolean(repoPath);

  const { mutate, isPending } = useCreatePatch();

  const [fromHash, setFromHash] = useState('');
  const [toHash, setToHash] = useState('');
  const [destDir, setDestDir] = useState('');

  const reset = useCallback((): void => {
    setFromHash('');
    setToHash('');
    setDestDir('');
  }, []);

  const handleOpenChange = (next: boolean): void => {
    if (!next && !isPending) {
      reset();
    }
    onOpenChange(next);
  };

  const pickDirectory = async (): Promise<void> => {
    if (typeof window === 'undefined' || !('api' in window)) return;
    const selected = await window.api.fsSelectDirectory();
    if (typeof selected === 'string' && selected.length > 0) {
      setDestDir(selected);
    }
  };

  const filteredFromCommits = useMemo(
    () => commits.filter((commit) => !toHash || matchesCommit(commit, toHash)),
    [commits, toHash]
  );

  const canSubmit =
    !isPending &&
    fromHash.length > 0 &&
    toHash.length > 0 &&
    fromHash !== toHash;

  const handleSubmit = (): void => {
    if (!canSubmit) return;
    mutate(
      {
        repoPath,
        range: buildRange(fromHash, toHash),
        ...(destDir ? { destDir } : {})
      },
      {
        onSuccess: (result) => {
          const count = result.files.length;
          toast.success({
            ...TOAST_MESSAGES.success,
            description:
              count === 0
                ? 'No patch files were produced'
                : `${count} ${count === 1 ? 'file' : 'files'} created`
          });
          handleOpenChange(false);
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
          title="Create patch"
          description="Pick a commit range and destination directory for the patch files."
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="create-patch-from"
                className="text-foreground text-xs font-medium"
              >
                From commit
              </label>
              <CommitPicker
                commits={commits}
                isLoading={isCommitsLoading}
                selectedHash={fromHash}
                onSelect={setFromHash}
                disabled={isPending}
                label="Pick the starting commit"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="create-patch-to"
                className="text-foreground text-xs font-medium"
              >
                To commit
              </label>
              <CommitPicker
                commits={filteredFromCommits}
                isLoading={isCommitsLoading}
                selectedHash={toHash}
                onSelect={setToHash}
                disabled={isPending}
                label="Pick the ending commit"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="create-patch-dest"
                className="text-foreground text-xs font-medium"
              >
                Destination directory
              </label>
              <div className="flex items-center gap-2">
                <code
                  className={cn(
                    'border-border bg-muted text-foreground/80 flex-1 truncate rounded-md border px-3 py-2 font-mono text-xs'
                  )}
                  aria-live="polite"
                >
                  {destDir || 'Not selected'}
                </code>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={pickDirectory}
                  disabled={isPending}
                  leftIcon={<FolderInput aria-hidden="true" className="size-4" />}
                >
                  Browse
                </Button>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => handleOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={handleSubmit}
                disabled={!canSubmit}
                loading={isPending}
                leftIcon={
                  !isPending ? (
                    <GitPullRequestArrow aria-hidden="true" className="size-4" />
                  ) : undefined
                }
              >
                Create
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

CreatePatchDialog.displayName = 'CreatePatchDialog';
