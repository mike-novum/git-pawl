import { useCallback, useEffect, useState } from 'react';
import type { FC } from 'react';
import { Save } from 'lucide-react';

import {
  Button,
  Dialog,
  Input,
  Skeleton,
  Spinner,
  useToast
} from '@/shared/ui';
import { cn } from '@/shared/lib/theme';

import {
  useGitConfig,
  useSetRepoConfig,
  type ConfigScope
} from '../model';

import type {
  ConfigFieldSpec,
  ConfigRowProps,
  RepoConfigDialogProps
} from './types';

const TOAST_MESSAGES = {
  success: { title: 'Config saved' },
  error: { title: 'Config save failed' }
} as const;

const FIELDS: ConfigFieldSpec[] = [
  {
    key: 'user.name',
    label: 'user.name',
    placeholder: 'Your name (local)',
    scope: 'local'
  },
  {
    key: 'user.name',
    label: 'user.name',
    placeholder: 'Your name (global)',
    scope: 'global'
  },
  {
    key: 'user.email',
    label: 'user.email',
    placeholder: 'Your email (local)',
    scope: 'local'
  },
  {
    key: 'user.email',
    label: 'user.email',
    placeholder: 'Your email (global)',
    scope: 'global'
  },
  {
    key: 'core.editor',
    label: 'core.editor',
    placeholder: 'Editor command',
    scope: 'local'
  },
  {
    key: 'remote.origin.url',
    label: 'remote URL',
    placeholder: 'https://github.com/owner/repo.git',
    scope: 'local'
  }
];

const ConfigRow: FC<ConfigRowProps> = ({
  repoPath,
  configKey,
  label,
  placeholder,
  scope,
  disabled,
  onSave,
  isSaving
}) => {
  const query = useGitConfig({ repoPath, key: configKey, scope });
  const remoteValue = query.data ?? '';

  const [draft, setDraft] = useState('');

  useEffect(() => {
    setDraft(remoteValue);
  }, [remoteValue]);

  const handleSave = (): void => {
    if (disabled || isSaving) return;
    if (draft === remoteValue) return;
    onSave({ key: configKey, value: draft, scope });
  };

  const handleReset = (): void => {
    setDraft(remoteValue);
  };

  const isDirty = draft !== remoteValue;
  const canSave = isDirty && !disabled && !isSaving;
  const showLoading = query.isLoading && !query.data;

  return (
    <div className="border-border bg-card flex flex-col gap-2 rounded-md border p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <code className="text-foreground rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
            {label}
          </code>
          <span
            className={cn(
              'inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] uppercase tracking-wide',
              scope === 'global'
                ? 'border-primary/40 bg-primary/10 text-primary'
                : 'border-border bg-muted text-muted-foreground'
            )}
          >
            {scope}
          </span>
        </div>
        {query.isError && (
          <span className="text-destructive text-xs">read failed</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {showLoading ? (
          <Skeleton className="h-10 flex-1 rounded-md" />
        ) : (
          <Input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={placeholder}
            disabled={disabled || isSaving}
            aria-label={`${label} (${scope})`}
            className="flex-1"
          />
        )}
        <Button
          type="button"
          size="sm"
          variant="primary"
          onClick={handleSave}
          disabled={!canSave}
          loading={isSaving}
          aria-label={`Save ${label}`}
          leftIcon={<Save aria-hidden="true" className="size-4" />}
        >
          Save
        </Button>
        {isDirty && !isSaving && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={handleReset}
            disabled={disabled}
          >
            Reset
          </Button>
        )}
      </div>
    </div>
  );
};

ConfigRow.displayName = 'ConfigRow';

export const RepoConfigDialog: FC<RepoConfigDialogProps> = ({
  open,
  onOpenChange,
  repoPath
}) => {
  const toast = useToast();
  const { mutate, isPending } = useSetRepoConfig();

  const handleSave = useCallback(
    (input: { key: string; value: string; scope: ConfigScope }): void => {
      mutate(
        {
          repoPath,
          key: input.key,
          value: input.value,
          scope: input.scope
        },
        {
          onSuccess: () => {
            toast.success({
              ...TOAST_MESSAGES.success,
              description: `${input.key} (${input.scope})`
            });
          },
          onError: (err) => {
            toast.error({
              ...TOAST_MESSAGES.error,
              description: err.message
            });
          }
        }
      );
    },
    [mutate, repoPath, toast]
  );

  const handleOpenChange = (next: boolean): void => {
    if (!next && isPending) return;
    onOpenChange(next);
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Content
          title="Repository config"
          description={`Edit git config keys for ${repoPath || 'this repository'}.`}
        >
          <div className="flex flex-col gap-3">
            {isPending && (
              <div
                className="text-muted-foreground inline-flex items-center gap-2 text-xs"
                aria-live="polite"
              >
                <Spinner size="sm" label="Saving" />
                Saving…
              </div>
            )}

            {FIELDS.map((field, index) => (
              <ConfigRow
                key={`${field.key}:${field.scope}:${index}`}
                repoPath={repoPath}
                configKey={field.key}
                label={field.label}
                placeholder={field.placeholder}
                scope={field.scope}
                disabled={!repoPath}
                isSaving={isPending}
                onSave={handleSave}
              />
            ))}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

RepoConfigDialog.displayName = 'RepoConfigDialog';
