import { useState, type ChangeEvent } from 'react';
import type { FC } from 'react';

import { Button, Dialog, Input, useToast } from '@/shared/ui';

import { useCreateBranch } from '../model';

import type { CreateBranchDialogProps } from './types';

export const CreateBranchDialog: FC<CreateBranchDialogProps> = ({
  open,
  onOpenChange,
  repoPath
}) => {
  const toast = useToast();
  const { mutate, isPending } = useCreateBranch();
  const [name, setName] = useState('');

  const handleClose = (next: boolean): void => {
    if (!next && isPending) return;
    if (!next) {
      setName('');
    }
    onOpenChange(next);
  };

  const handleNameChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setName(event.target.value);
  };

  const handleSubmit = (): void => {
    const trimmed = name.trim();
    if (!trimmed || isPending) return;
    mutate(
      { repoPath, ref: trimmed },
      {
        onSuccess: () => {
          toast.success({
            title: `Ветка ${trimmed} создана`
          });
          setName('');
          onOpenChange(false);
        },
        onError: (err) => {
          toast.error({
            title: `Не удалось создать ветку ${trimmed}`,
            description: err.message
          });
        }
      }
    );
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleClose}>
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Content
          title="Create branch"
          description="Create a new branch from the current HEAD and switch to it."
        >
          <form
            className="flex flex-col gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              handleSubmit();
            }}
          >
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="create-branch-name"
                className="text-foreground text-xs font-medium"
              >
                Branch name
              </label>
              <Input
                id="create-branch-name"
                name="create-branch-name"
                autoComplete="off"
                spellCheck={false}
                placeholder="feature/my-branch"
                value={name}
                onChange={handleNameChange}
                disabled={isPending}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => handleClose(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={!name.trim()}
                loading={isPending}
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

CreateBranchDialog.displayName = 'CreateBranchDialog';
