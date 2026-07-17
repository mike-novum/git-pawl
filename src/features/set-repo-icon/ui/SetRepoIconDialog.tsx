import { useEffect, useState } from 'react';
import type { ChangeEvent, FC } from 'react';
import { AlertCircle, ImageIcon, Upload } from 'lucide-react';

import { Button, Dialog, useToast } from '@/shared/ui';

import { useSetRepoIcon } from '../model';

import type { SetRepoIconDialogProps } from './types';

type FileWithPath = File & { path?: string };

const resolveFilePath = (file: File): string | null => {
  const candidate = (file as FileWithPath).path;
  if (typeof candidate === 'string' && candidate.length > 0) {
    return candidate;
  }
  return null;
};

const isImageFile = (file: File): boolean => file.type.startsWith('image/');

export const SetRepoIconDialog: FC<SetRepoIconDialogProps> = ({
  open,
  onOpenChange,
  repoPath,
  repoName
}) => {
  const toast = useToast();
  const { mutate, isPending, error, reset } = useSetRepoIcon();

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const submitDisabled = !repoPath || !file || isPending;
  const displayName =
    repoName?.trim() || repoPath.split(/[\\/]/).pop() || repoPath;

  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl]
  );

  const clearPreview = (): void => {
    setFile(null);
    setPreviewUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return null;
    });
    setLocalError(null);
  };

  const handleClose = (): void => {
    clearPreview();
    reset();
    onOpenChange(false);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const next = event.target.files?.[0] ?? null;
    if (!next) {
      clearPreview();
      return;
    }
    if (!isImageFile(next)) {
      setLocalError('Please choose an image file (PNG or JPG).');
      setFile(null);
      setPreviewUrl((current) => {
        if (current) URL.revokeObjectURL(current);
        return null;
      });
      return;
    }

    const sourcePath = resolveFilePath(next);
    if (!sourcePath) {
      setLocalError('Cannot resolve selected file path.');
      return;
    }

    setLocalError(null);
    setFile(next);
    setPreviewUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return URL.createObjectURL(next);
    });
  };

  const handleSubmit = (): void => {
    if (!file || !repoPath) return;
    const sourceImagePath = resolveFilePath(file);
    if (!sourceImagePath) {
      setLocalError('Cannot resolve selected file path.');
      return;
    }

    mutate(
      { repoPath, sourceImagePath },
      {
        onSuccess: () => {
          toast.success({
            title: 'Icon updated',
            description: displayName
          });
          handleClose();
        },
        onError: (err) => {
          toast.error({
            title: 'Failed to set icon',
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
          title="Set repository icon"
          description={`Choose an image to use as the icon for ${displayName}. It will be cropped to a square and resized to 256×256.`}
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <span className="text-foreground text-xs font-medium">
                Image file
              </span>
              <label
                htmlFor="set-repo-icon-file"
                className="border-border bg-muted/30 text-muted-foreground hover:bg-muted/50 flex cursor-pointer items-center gap-2 rounded-md border border-dashed px-3 py-2 text-sm transition-colors"
              >
                <Upload aria-hidden="true" className="size-4" />
                <span className="truncate">
                  {file ? file.name : 'Choose image...'}
                </span>
                <input
                  id="set-repo-icon-file"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={isPending}
                  className="sr-only"
                />
              </label>
              {localError && (
                <p className="text-destructive flex items-center gap-1 text-xs">
                  <AlertCircle className="size-3" />
                  {localError}
                </p>
              )}
            </div>

            <div className="flex flex-col items-center gap-2">
              <span className="text-foreground text-xs font-medium">Preview</span>
              <div className="bg-muted/30 flex aspect-square w-full max-w-[200px] items-center justify-center overflow-hidden rounded-md border">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Icon preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-muted-foreground flex flex-col items-center gap-1 text-xs">
                    <ImageIcon aria-hidden="true" className="size-6" />
                    No image selected
                  </span>
                )}
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="border-destructive/40 bg-destructive/10 text-destructive flex items-start gap-2 rounded-md border px-3 py-2 text-xs"
              >
                <AlertCircle
                  className="mt-0.5 size-3.5 shrink-0"
                  aria-hidden="true"
                />
                <span>{error.message}</span>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="ghost"
                onClick={handleClose}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={submitDisabled}
                loading={isPending}
              >
                Set icon
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

SetRepoIconDialog.displayName = 'SetRepoIconDialog';
