import { useEffect, useMemo, useState } from 'react';
import type { FC } from 'react';
import { AlertCircle, GitBranch, GitFork } from 'lucide-react';

import { Button, Input, Spinner, useToast } from '@/shared/ui';

import { useCloneRepo } from '../model';
import type { CloneRepoInput } from '../model';

import type { CloneByUrlFormProps } from './types';

const basename = (path: string): string => {
  const cleaned = path.replace(/[\\/]+$/, '');
  const parts = cleaned.split(/[\\/]/);
  return parts[parts.length - 1] ?? cleaned;
};

const isHttpUrl = (value: string): boolean => {
  const trimmed = value.trim();
  if (!trimmed) return false;
  return /^(https?|git|ssh):\/\//i.test(trimmed) || trimmed.startsWith('git@');
};

const guessRepoName = (url: string): string => {
  const trimmed = url.trim().replace(/\.git$/, '');
  const lastSlash = trimmed.lastIndexOf('/');
  const afterColon = trimmed.lastIndexOf(':');
  const start = Math.max(lastSlash, afterColon) + 1;
  const candidate = trimmed.slice(start).replace(/\.git$/, '');
  return candidate || 'repo';
};

export const CloneByUrlForm: FC<CloneByUrlFormProps> = ({
  activeWorkspace,
  onSuccess
}) => {
  const toast = useToast();
  const { mutate, isPending, error, progress, reset } = useCloneRepo();

  const workspacePath = activeWorkspace?.path ?? '';

  const defaultDest = useMemo(
    () => (workspacePath ? `${workspacePath}/${guessRepoName('')}` : ''),
    [workspacePath]
  );

  const [url, setUrl] = useState('');
  const [destPath, setDestPath] = useState(defaultDest);
  const [urlError, setUrlError] = useState<string | null>(null);

  useEffect(() => {
    setDestPath((current) => {
      if (url) {
        const path = workspacePath
          ? `${workspacePath}/${guessRepoName(url)}`
          : guessRepoName(url);
        if (path) return path;
      }
      return current || defaultDest;
    });
  }, [defaultDest, url, workspacePath]);

  const submitDisabled = !url.trim() || !destPath.trim() || isPending;

  const handleSubmit = (): void => {
    const trimmedUrl = url.trim();
    const trimmedDest = destPath.trim();
    if (!isHttpUrl(trimmedUrl)) {
      setUrlError('Enter a valid http(s), git, or ssh URL');
      return;
    }
    setUrlError(null);
    const payload: CloneRepoInput = { url: trimmedUrl, destPath: trimmedDest };
    mutate(payload, {
      onSuccess: () => {
        toast.success({
          title: 'Repository cloned',
          description: basename(trimmedDest)
        });
        reset();
        setUrl('');
        setDestPath(defaultDest);
        onSuccess?.(payload);
      },
      onError: (err) => {
        toast.error({
          title: 'Clone failed',
          description: err.message
        });
      }
    });
  };

  const handleUrlChange = (value: string): void => {
    setUrl(value);
    if (urlError) setUrlError(null);
  };

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (submitDisabled) return;
        handleSubmit();
      }}
    >
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="clone-by-url"
          className="text-foreground text-xs font-medium"
        >
          Repository URL
        </label>
        <Input
          id="clone-by-url"
          type="url"
          inputMode="url"
          autoComplete="off"
          spellCheck={false}
          placeholder="https://github.com/owner/repository.git"
          value={url}
          onChange={(event) => handleUrlChange(event.target.value)}
          disabled={isPending}
          aria-invalid={Boolean(urlError)}
          leftIcon={<GitFork className="size-4" />}
        />
        {urlError && (
          <p className="text-destructive flex items-center gap-1 text-xs">
            <AlertCircle className="size-3" />
            {urlError}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="clone-by-url-dest"
          className="text-foreground text-xs font-medium"
        >
          Destination
          {activeWorkspace && (
            <span className="text-muted-foreground ml-1">
              ({activeWorkspace.name})
            </span>
          )}
        </label>
        <Input
          id="clone-by-url-dest"
          type="text"
          autoComplete="off"
          spellCheck={false}
          placeholder={
            activeWorkspace
              ? `${activeWorkspace.path}/my-repo`
              : '/path/to/destination'
          }
          value={destPath}
          onChange={(event) => setDestPath(event.target.value)}
          disabled={isPending}
          leftIcon={<GitBranch className="size-4" />}
        />
        {!activeWorkspace && (
          <p className="text-muted-foreground text-xs">
            Pick or create a workspace first — the destination defaults to the
            active workspace folder.
          </p>
        )}
      </div>

      {isPending && (
        <div className="border-border bg-muted/30 text-muted-foreground flex items-center gap-2 rounded-md border px-3 py-2 text-xs">
          <Spinner size="sm" label={progress ?? 'Cloning repository'} />
          <span className="truncate">
            {progress ? progress : 'Cloning repository...'}
          </span>
        </div>
      )}

      {error && !isPending && (
        <div
          role="alert"
          className="border-destructive/40 bg-destructive/10 text-destructive flex items-start gap-2 rounded-md border px-3 py-2 text-xs"
        >
          <AlertCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          <span>{error.message}</span>
        </div>
      )}

      <div className="flex justify-end pt-1">
        <Button type="submit" disabled={submitDisabled} loading={isPending}>
          Clone
        </Button>
      </div>
    </form>
  );
};

CloneByUrlForm.displayName = 'CloneByUrlForm';
