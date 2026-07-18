import { useEffect, useMemo, useRef, useState } from 'react';
import type { FC } from 'react';
import { FolderSearch, FolderTree, Search } from 'lucide-react';

import { Button, Dialog, Empty, Input, Spinner, useToast } from '@/shared/ui';

import { useCreateWorkspaceFlow } from '../model';

import type { CreateWorkspaceDialogProps } from './types';

const basename = (path: string): string => {
  const cleaned = path.replace(/[\\/]+$/, '');
  const parts = cleaned.split(/[\\/]/);
  return parts[parts.length - 1] ?? cleaned;
};

export const CreateWorkspaceDialog: FC<CreateWorkspaceDialogProps> = ({
  open,
  onOpenChange
}) => {
  const toast = useToast();
  const { path, stage, preview, pickDirectory, submit, reset } =
    useCreateWorkspaceFlow();
  const [name, setName] = useState('');
  const [pickError, setPickError] = useState<string | null>(null);

  const resetRef = useRef(reset);
  useEffect(() => {
    resetRef.current = reset;
  });

  useEffect(() => {
    if (!open) {
      setName('');
      setPickError(null);
      resetRef.current();
    }
  }, [open]);

  const handlePick = async (): Promise<void> => {
    try {
      setPickError(null);
      await pickDirectory();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setPickError(message);
    }
  };

  const repoBasenames = useMemo(
    () => preview.repos.map((repoPath) => basename(repoPath)),
    [preview.repos]
  );

  const submitDisabled =
    !path || stage === 'submitting' || stage === 'previewing';

  const handleSubmit = async (): Promise<void> => {
    if (!path) return;
    const ok = await submit(name);
    if (ok) {
      toast.success({
        title: 'Workspace created',
        description: name.trim().length > 0 ? name.trim() : basename(path)
      });
      onOpenChange(false);
    } else {
      toast.error({
        title: 'Failed to create workspace',
        description: 'Check that the directory exists and try again.'
      });
    }
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          reset();
        }
        onOpenChange(next);
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Content
          title="New workspace"
          description="Pick a folder containing git repositories. We will scan it for you."
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="workspace-create-name"
                className="text-foreground text-xs font-medium"
              >
                Workspace name <span className="text-muted-foreground">(optional)</span>
              </label>
              <Input
                id="workspace-create-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={
                  path ? basename(path) : 'Defaults to folder name'
                }
                disabled={stage === 'submitting'}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-foreground text-xs font-medium">Directory</span>
              <div className="flex items-stretch gap-2">
                <Input
                  readOnly
                  value={path ?? ''}
                  placeholder="No folder selected"
                  disabled={stage === 'submitting'}
                  className="bg-muted/30 font-mono text-xs"
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handlePick}
                  disabled={stage === 'submitting'}
                  leftIcon={<FolderSearch className="size-4" />}
                >
                  Browse...
                </Button>
              </div>
              {pickError && (
                <p className="text-destructive text-xs">{pickError}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-foreground text-xs font-medium">
                Detected repositories
              </span>
              {!path ? (
                <Empty
                  title="Pick a folder to scan"
                  description="Choose a directory above to preview the repositories we will add."
                  icon={<Search className="size-6" />}
                />
              ) : preview.isScanning ? (
                <div className="border-border text-muted-foreground flex items-center gap-2 rounded-md border border-dashed px-4 py-6 text-sm">
                  <Spinner size="sm" label="Scanning" />
                  Scanning folder for git repositories...
                </div>
              ) : repoBasenames.length === 0 ? (
                <Empty
                  title="No git repositories found"
                  description="You can still create the workspace and add repos later."
                  icon={<FolderTree className="size-6" />}
                />
              ) : (
                <ul className="border-border bg-muted/20 max-h-40 divide-y divide-border overflow-auto rounded-md border text-sm">
                  {repoBasenames.map((entry, index) => (
                    <li
                      key={`${entry}-${index}`}
                      className="flex items-center gap-2 px-3 py-2"
                    >
                      <FolderTree className="text-muted-foreground size-4" />
                      <span className="truncate font-mono text-xs">{entry}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                disabled={stage === 'submitting'}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={submitDisabled}
                loading={stage === 'submitting'}
              >
                Create workspace
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

CreateWorkspaceDialog.displayName = 'CreateWorkspaceDialog';
