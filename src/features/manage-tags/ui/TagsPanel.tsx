import { useMemo, useState } from 'react';
import type { FC } from 'react';
import { Plus, Tag as TagIcon, Trash2 } from 'lucide-react';

import { useBranches, type Branch } from '@/entities/branch';
import { useTags, type Tag } from '@/entities/tag';
import {
  Button,
  Dialog,
  Empty,
  Input,
  ScrollArea,
  Spinner,
  useToast
} from '@/shared/ui';
import { cn } from '@/shared/lib/theme';

import { useCreateTag, useDeleteTag } from '../model';

import type { TagsPanelProps } from './types';

const SHORT_HASH_LENGTH = 12;

const TOAST_MESSAGES = {
  create: {
    success: { title: 'Tag created' },
    error: { title: 'Tag creation failed' }
  },
  delete: {
    success: { title: 'Tag deleted' },
    error: { title: 'Tag deletion failed' }
  }
} as const;

const shortTarget = (target: string): string =>
  target.length > SHORT_HASH_LENGTH ? target.slice(0, SHORT_HASH_LENGTH) : target;

const branchOptions = (branches: Branch[]): Array<{ value: string; label: string }> =>
  branches.map((branch) => ({ value: branch.name, label: branch.name }));

type CreateTagDialogProps = {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  repoPath: string;
  branches: Branch[];
  disabled: boolean;
  onSubmit: (input: {
    name: string;
    target: string;
    annotated: boolean;
    message: string;
  }) => void;
};

const CreateTagDialog: FC<CreateTagDialogProps> = ({
  open,
  onOpenChange,
  repoPath,
  branches,
  disabled,
  onSubmit
}) => {
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [annotated, setAnnotated] = useState(true);
  const [message, setMessage] = useState('');

  const reset = (): void => {
    setName('');
    setTarget('');
    setAnnotated(true);
    setMessage('');
  };

  const handleOpenChange = (next: boolean): void => {
    if (!next && !disabled) {
      reset();
    }
    onOpenChange(next);
  };

  const trimmedName = name.trim();
  const trimmedTarget = target.trim();
  const canSubmit = trimmedName.length > 0 && !disabled;

  const handleSubmit = (event: { preventDefault?: () => void }): void => {
    event?.preventDefault?.();
    if (!canSubmit) return;
    onSubmit({
      name: trimmedName,
      target: trimmedTarget,
      annotated,
      message: message.trim()
    });
  };

  const branchSelectOptions = useMemo(() => branchOptions(branches), [branches]);

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Content
          title="Create tag"
          description={`Create a new tag in ${repoPath}.`}
        >
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="manage-tags-name"
                className="text-foreground text-xs font-medium"
              >
                Name
              </label>
              <Input
                id="manage-tags-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="v1.0.0"
                disabled={disabled}
                autoFocus
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="manage-tags-target"
                className="text-foreground text-xs font-medium"
              >
                Target (branch, tag, or commit)
              </label>
              <Input
                id="manage-tags-target"
                value={target}
                onChange={(event) => setTarget(event.target.value)}
                placeholder="HEAD (default)"
                disabled={disabled}
                list="manage-tags-branches"
              />
              <datalist id="manage-tags-branches">
                {branchSelectOptions.map((option) => (
                  <option key={option.value} value={option.value} />
                ))}
              </datalist>
            </div>

            <label className="text-foreground inline-flex items-center gap-2 text-sm select-none">
              <input
                type="checkbox"
                checked={annotated}
                onChange={(event) => setAnnotated(event.target.checked)}
                disabled={disabled}
                className="size-4 accent-primary"
              />
              <span>Annotated tag (with message)</span>
            </label>

            {annotated && (
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="manage-tags-message"
                  className="text-foreground text-xs font-medium"
                >
                  Message
                </label>
                <Input
                  id="manage-tags-message"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Release notes (optional, defaults to name)"
                  disabled={disabled}
                />
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => handleOpenChange(false)}
                disabled={disabled}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={!canSubmit}
                loading={disabled}
              >
                Create
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

CreateTagDialog.displayName = 'CreateTagDialog';

type DeleteTagDialogProps = {
  open: boolean;
  tagName: string | null;
  isDeleting: boolean;
  onOpenChange: (next: boolean) => void;
  onConfirm: () => void;
};

const DeleteTagDialog: FC<DeleteTagDialogProps> = ({
  open,
  tagName,
  isDeleting,
  onOpenChange,
  onConfirm
}) => (
  <Dialog.Root open={open} onOpenChange={onOpenChange}>
    <Dialog.Portal>
      <Dialog.Backdrop />
      <Dialog.Content
        title="Delete tag?"
        description={
          tagName
            ? `Tag "${tagName}" will be removed from the repository. This cannot be undone.`
            : 'This tag will be removed from the repository.'
        }
      >
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            loading={isDeleting}
          >
            Delete
          </Button>
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
);

DeleteTagDialog.displayName = 'DeleteTagDialog';

type TagRowProps = {
  tag: Tag;
  disabled: boolean;
  onDelete: (tag: Tag) => void;
};

const TagRow: FC<TagRowProps> = ({ tag, disabled, onDelete }) => {
  const handleClick = (): void => {
    if (disabled) return;
    onDelete(tag);
  };

  return (
    <li className="border-border bg-card flex items-center gap-3 rounded-md border px-3 py-2">
      <TagIcon
        aria-hidden="true"
        className="text-muted-foreground size-4 shrink-0"
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate font-mono text-sm">{tag.name}</span>
        <span className="text-muted-foreground flex items-center gap-2 text-xs">
          <span
            className={cn(
              'inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] uppercase tracking-wide',
              tag.type === 'annotated'
                ? 'border-primary/40 bg-primary/10 text-primary'
                : 'border-border bg-muted text-muted-foreground'
            )}
          >
            {tag.type}
          </span>
          <span className="font-mono">→ {shortTarget(tag.target)}</span>
        </span>
      </div>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={handleClick}
        disabled={disabled}
        aria-label={`Delete tag ${tag.name}`}
        leftIcon={<Trash2 aria-hidden="true" className="size-4" />}
      >
        Delete
      </Button>
    </li>
  );
};

TagRow.displayName = 'TagRow';

export const TagsPanel: FC<TagsPanelProps> = ({ repoPath, className }) => {
  const toast = useToast();
  const tagsQuery = useTags(repoPath);
  const branchesQuery = useBranches(repoPath);

  const [createOpen, setCreateOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Tag | null>(null);

  const { mutate: mutateCreate, isPending: isCreating } = useCreateTag();
  const { mutate: mutateDelete, isPending: isDeleting } = useDeleteTag();

  const tags = tagsQuery.data ?? [];
  const branches = branchesQuery.data ?? [];
  const isLoading = tagsQuery.isLoading || tagsQuery.isFetching;
  const isMutationBusy = isCreating || isDeleting;
  const isEmpty = !isLoading && tags.length === 0;

  const closeCreate = (next: boolean): void => {
    if (isCreating) return;
    setCreateOpen(next);
  };

  const handleCreate = (input: {
    name: string;
    target: string;
    annotated: boolean;
    message: string;
  }): void => {
    if (isCreating) return;
    mutateCreate(
      {
        repoPath,
        name: input.name,
        ...(input.target ? { target: input.target } : {}),
        ...(input.annotated ? { annotated: true } : {}),
        ...(input.message ? { message: input.message } : {})
      },
      {
        onSuccess: () => {
          toast.success(TOAST_MESSAGES.create.success);
          setCreateOpen(false);
        },
        onError: (err) =>
          toast.error({
            ...TOAST_MESSAGES.create.error,
            description: err.message
          })
      }
    );
  };

  const requestDelete = (tag: Tag): void => {
    if (isMutationBusy) return;
    setPendingDelete(tag);
  };

  const closeDelete = (next: boolean): void => {
    if (isDeleting) return;
    if (!next) setPendingDelete(null);
  };

  const confirmDelete = (): void => {
    const tag = pendingDelete;
    if (!tag || isDeleting) return;
    mutateDelete(
      { repoPath, name: tag.name },
      {
        onSuccess: () => {
          toast.success({
            ...TOAST_MESSAGES.delete.success,
            description: tag.name
          });
          setPendingDelete(null);
        },
        onError: (err) => {
          toast.error({
            ...TOAST_MESSAGES.delete.error,
            description: err.message
          });
        }
      }
    );
  };

  return (
    <section
      aria-label="Tags"
      className={cn('border-border bg-background flex flex-col gap-3 rounded-lg border p-4', className)}
    >
      <header className="flex items-center justify-between gap-2">
        <div className="flex flex-col">
          <h2 className="text-foreground text-sm font-semibold">Tags</h2>
          <p className="text-muted-foreground text-xs">
            {tags.length} {tags.length === 1 ? 'tag' : 'tags'}
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="primary"
          onClick={() => setCreateOpen(true)}
          disabled={!repoPath || isMutationBusy}
          leftIcon={<Plus aria-hidden="true" className="size-4" />}
        >
          New tag
        </Button>
      </header>

      {isLoading ? (
        <div
          className="text-muted-foreground inline-flex items-center gap-2 text-sm"
          aria-live="polite"
        >
          <Spinner size="sm" label="Loading tags" />
          Loading tags…
        </div>
      ) : isEmpty ? (
        <Empty
          icon={<TagIcon className="size-6" />}
          title="No tags yet"
          description="Create the first tag to mark a release point in this repository."
        />
      ) : (
        <ScrollArea className="border-border bg-muted/20 max-h-80 rounded-md border">
          <ul className="flex flex-col gap-1.5 p-2">
            {tags.map((tag) => (
              <TagRow
                key={tag.name}
                tag={tag}
                disabled={isMutationBusy}
                onDelete={requestDelete}
              />
            ))}
          </ul>
        </ScrollArea>
      )}

      <CreateTagDialog
        open={createOpen}
        onOpenChange={closeCreate}
        repoPath={repoPath}
        branches={branches}
        disabled={isCreating}
        onSubmit={handleCreate}
      />

      <DeleteTagDialog
        open={pendingDelete !== null}
        tagName={pendingDelete?.name ?? null}
        isDeleting={isDeleting}
        onOpenChange={closeDelete}
        onConfirm={confirmDelete}
      />
    </section>
  );
};

TagsPanel.displayName = 'TagsPanel';