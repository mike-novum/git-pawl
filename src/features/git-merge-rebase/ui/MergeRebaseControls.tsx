import { useMemo, useState } from 'react';
import type { FC } from 'react';
import { ChevronDown, GitMerge, GitPullRequestArrow } from 'lucide-react';

import { Button, Dialog, Spinner, useToast } from '@/shared/ui';
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuPositioner,
  DropdownMenuRoot,
  DropdownMenuTrigger
} from '@/shared/ui/dropdown-menu';
import { useBranches } from '@/entities/branch';

import { useMerge, useRebase } from '../model';

import type { MergeRebaseControlsProps } from './types';

type ActionKind = 'merge' | 'rebase';

const TOAST_MESSAGES = {
  merge: {
    success: { title: 'Merge complete', description: 'Branch merged into HEAD' },
    error: { title: 'Merge failed' },
    conflict: { title: 'Merge conflicts', description: 'Resolve conflicts before continuing' }
  },
  rebase: {
    success: { title: 'Rebase complete', description: 'Branch rebased onto target' },
    error: { title: 'Rebase failed' },
    conflict: { title: 'Rebase conflicts', description: 'Resolve conflicts before continuing' }
  }
} as const;

const detectConflict = (message: string): boolean => {
  const lower = message.toLowerCase();
  return lower.includes('conflict') || lower.includes('merge conflict');
};

export const MergeRebaseControls: FC<MergeRebaseControlsProps> = ({
  repoPath,
  disabled = false,
  className
}) => {
  const toast = useToast();
  const { mutate: mutateMerge, isPending: isMergePending } = useMerge();
  const { mutate: mutateRebase, isPending: isRebasePending } = useRebase();

  const [activeAction, setActiveAction] = useState<ActionKind | null>(null);
  const [selectedBranch, setSelectedBranch] = useState('');

  const isAnyPending = isMergePending || isRebasePending;
  const isDisabled = disabled || !repoPath || isAnyPending;

  const branchesQuery = useBranches(repoPath || null);
  const isBranchesLoading = branchesQuery.isLoading && Boolean(repoPath);

  const branchOptions = useMemo(
    () =>
      (branchesQuery.data ?? []).map((branch) => ({
        value: branch.name,
        label: branch.name,
        disabled: branch.current
      })),
    [branchesQuery.data]
  );

  const activeIsPending =
    activeAction === 'merge' ? isMergePending : activeAction === 'rebase' ? isRebasePending : false;

  const openDialog = (kind: ActionKind): void => {
    setActiveAction(kind);
    setSelectedBranch('');
  };

  const closeDialog = (): void => {
    if (activeIsPending) return;
    setActiveAction(null);
    setSelectedBranch('');
  };

  const handleConfirm = (): void => {
    if (!repoPath || !selectedBranch || !activeAction) return;
    const branch = selectedBranch;

    if (activeAction === 'merge') {
      mutateMerge(
        { repoPath, branch },
        {
          onSuccess: () => {
            toast.success(TOAST_MESSAGES.merge.success);
            closeDialog();
          },
          onError: (err) => {
            if (detectConflict(err.message)) {
              toast.error({
                ...TOAST_MESSAGES.merge.conflict,
                description: err.message
              });
            } else {
              toast.error({
                ...TOAST_MESSAGES.merge.error,
                description: err.message
              });
            }
          }
        }
      );
      return;
    }

    mutateRebase(
      { repoPath, branch },
      {
        onSuccess: () => {
          toast.success(TOAST_MESSAGES.rebase.success);
          closeDialog();
        },
        onError: (err) => {
          if (detectConflict(err.message)) {
            toast.error({
              ...TOAST_MESSAGES.rebase.conflict,
              description: err.message
            });
          } else {
            toast.error({
              ...TOAST_MESSAGES.rebase.error,
              description: err.message
            });
          }
        }
      }
    );
  };

  const dialogOpen = activeAction !== null;
  const dialogTitle = activeAction === 'merge' ? 'Merge branch' : 'Rebase branch';
  const dialogDescription =
    activeAction === 'merge'
      ? 'Pick a branch to merge into the current branch.'
      : 'Pick a branch to rebase the current branch onto.';
  const confirmLabel = activeAction === 'merge' ? 'Merge' : 'Rebase';
  const canConfirm = !activeIsPending && selectedBranch.length > 0;

  return (
    <>
      <DropdownMenuRoot>
        <DropdownMenuTrigger
          aria-label="Merge or rebase"
          disabled={isDisabled}
          className={className}
        >
          <span className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-sm">
            <GitMerge aria-hidden="true" className="size-4" />
            <span>Merge / Rebase</span>
            <ChevronDown aria-hidden="true" className="text-muted-foreground size-4" />
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuPositioner sideOffset={6} align="end">
            <DropdownMenuContent className="min-w-48">
              <DropdownMenuItem disabled={isDisabled} onClick={() => openDialog('merge')}>
                <GitMerge aria-hidden="true" className="text-muted-foreground size-4" />
                Merge
              </DropdownMenuItem>
              <DropdownMenuItem disabled={isDisabled} onClick={() => openDialog('rebase')}>
                <GitPullRequestArrow
                  aria-hidden="true"
                  className="text-muted-foreground size-4"
                />
                Rebase
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenuPositioner>
        </DropdownMenuPortal>
      </DropdownMenuRoot>

      <Dialog.Root open={dialogOpen} onOpenChange={(next) => !next && closeDialog()}>
        <Dialog.Portal>
          <Dialog.Backdrop />
          <Dialog.Content title={dialogTitle} description={dialogDescription}>
            <div className="flex flex-col gap-4">
              {isBranchesLoading ? (
                <div
                  className="text-muted-foreground inline-flex items-center gap-2 text-sm"
                  aria-live="polite"
                >
                  <Spinner size="sm" label="Loading branches" />
                  Loading branches…
                </div>
              ) : branchOptions.length === 0 ? (
                <p className="text-muted-foreground text-sm">No branches available.</p>
              ) : (
                <ul
                  className="divide-border max-h-64 divide-y overflow-y-auto rounded-md border border-border bg-card"
                  role="listbox"
                  aria-label="Branches"
                >
                  {branchOptions.map((option) => {
                    const isSelected = option.value === selectedBranch;
                    return (
                      <li
                        key={option.value}
                        role="option"
                        aria-selected={isSelected}
                        aria-disabled={option.disabled}
                        tabIndex={option.disabled ? -1 : 0}
                        onClick={() => {
                          if (!option.disabled) setSelectedBranch(option.value);
                        }}
                        onKeyDown={(event) => {
                          if (option.disabled) return;
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            setSelectedBranch(option.value);
                          }
                        }}
                        className={
                          option.disabled
                            ? 'text-muted-foreground cursor-not-allowed px-3 py-2 font-mono text-sm opacity-60'
                            : isSelected
                              ? 'bg-muted/60 cursor-pointer px-3 py-2 font-mono text-sm'
                              : 'cursor-pointer px-3 py-2 font-mono text-sm hover:bg-muted/60 focus-visible:ring-ring focus:outline-none focus-visible:ring-2'
                        }
                      >
                        {option.label}
                      </li>
                    );
                  })}
                </ul>
              )}
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={closeDialog}
                  disabled={activeIsPending}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleConfirm}
                  disabled={!canConfirm}
                  loading={activeIsPending}
                >
                  {confirmLabel}
                </Button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
};

MergeRebaseControls.displayName = 'MergeRebaseControls';