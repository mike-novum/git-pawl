import type { FC } from 'react';
import { useCallback, useEffect } from 'react';
import { useForm, type FieldErrors, type FieldValues, type Resolver } from 'react-hook-form';
import { z } from 'zod';
import { AlertCircle, Save } from 'lucide-react';

import { Button, Dialog, Input, Select, Switch, useToast } from '@/shared/ui';

import {
  DEFAULT_SETTINGS,
  useGlobalSettings
} from '../model';

import type {
  GlobalSettingsValues,
  SettingsDialogProps,
  SettingsFormProps
} from './types';

const AUTO_FETCH_MIN = 1;
const AUTO_FETCH_MAX = 1440;

const formSchema = z.object({
  theme: z.union([z.literal('dark'), z.literal('light'), z.literal('system')]),
  editor: z.string().trim(),
  autoFetchInterval: z
    .number()
    .int()
    .min(AUTO_FETCH_MIN, `Minimum ${AUTO_FETCH_MIN} minute`)
    .max(AUTO_FETCH_MAX, `Maximum ${AUTO_FETCH_MAX} minutes`),
  diffViewMode: z.union([z.literal('unified'), z.literal('split')]),
  confirmDestructiveOps: z.boolean()
});

const zodResolver =
  <T extends FieldValues>(schema: z.ZodType<T>): Resolver<T> =>
  async (values, _context, _options) => {
    const result = schema.safeParse(values);
    if (result.success) {
      return { values: result.data, errors: {} };
    }

    const errors: FieldErrors<T> = {} as FieldErrors<T>;
    const bucket = errors as Record<string, { type: string; message: string }>;
    for (const issue of result.error.issues) {
      const key = issue.path[0];
      if (typeof key !== 'string') continue;
      bucket[key] = { type: issue.code, message: issue.message };
    }

    return { values: {} as Record<string, never>, errors };
  };

const THEME_OPTIONS = [
  { value: 'dark', label: 'Dark' },
  { value: 'light', label: 'Light' },
  { value: 'system', label: 'Follow system' }
] as const;

const DIFF_OPTIONS = [
  { value: 'unified', label: 'Unified' },
  { value: 'split', label: 'Side by side' }
] as const;

const SettingsForm: FC<SettingsFormProps> = ({ onSuccess }) => {
  const toast = useToast();
  const { values, setValues } = useGlobalSettings();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty }
  } = useForm<GlobalSettingsValues>({
    defaultValues: values,
    resolver: zodResolver(formSchema)
  });

  const watchedTheme = watch('theme');
  const watchedDiff = watch('diffViewMode');
  const watchedConfirm = watch('confirmDestructiveOps');

  useEffect(() => {
    reset(values);
  }, [values, reset]);

  const handleResetDefaults = (): void => {
    reset(DEFAULT_SETTINGS);
  };

  const onSubmit = handleSubmit((next) => {
    setValues({
      theme: next.theme,
      editor: next.editor.trim(),
      autoFetchInterval: next.autoFetchInterval,
      diffViewMode: next.diffViewMode,
      confirmDestructiveOps: next.confirmDestructiveOps
    });
    toast.success({ title: 'Settings saved' });
    onSuccess?.();
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="settings-theme"
          className="text-foreground text-xs font-medium"
        >
          Theme
        </label>
        <Select
          options={THEME_OPTIONS.map((option) => ({
            value: option.value,
            label: option.label
          }))}
          value={watchedTheme}
          onValueChange={(next) => {
            const safe = next === 'dark' || next === 'light' || next === 'system'
              ? next
              : 'system';
            setValue('theme', safe, { shouldDirty: true });
          }}
          placeholder="Pick theme"
          className="w-full"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="settings-editor"
          className="text-foreground text-xs font-medium"
        >
          Default editor{' '}
          <span className="text-muted-foreground">(git core.editor)</span>
        </label>
        <Input
          id="settings-editor"
          autoComplete="off"
          placeholder="code --wait"
          aria-invalid={Boolean(errors.editor)}
          {...register('editor')}
        />
        {errors.editor?.message && (
          <p className="text-destructive flex items-center gap-1 text-xs">
            <AlertCircle className="size-3" />
            {errors.editor.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="settings-auto-fetch"
          className="text-foreground text-xs font-medium"
        >
          Auto-fetch interval (minutes)
        </label>
        <Input
          id="settings-auto-fetch"
          type="number"
          inputMode="numeric"
          min={AUTO_FETCH_MIN}
          max={AUTO_FETCH_MAX}
          aria-invalid={Boolean(errors.autoFetchInterval)}
          {...register('autoFetchInterval', { valueAsNumber: true })}
        />
        {errors.autoFetchInterval?.message && (
          <p className="text-destructive flex items-center gap-1 text-xs">
            <AlertCircle className="size-3" />
            {errors.autoFetchInterval.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="settings-diff-view"
          className="text-foreground text-xs font-medium"
        >
          Diff view mode
        </label>
        <Select
          options={DIFF_OPTIONS.map((option) => ({
            value: option.value,
            label: option.label
          }))}
          value={watchedDiff}
          onValueChange={(next) => {
            const safe = next === 'unified' || next === 'split' ? next : 'unified';
            setValue('diffViewMode', safe, { shouldDirty: true });
          }}
          placeholder="Pick mode"
          className="w-full"
        />
      </div>

      <label
        htmlFor="settings-confirm-destructive"
        className="border-border bg-card flex items-center justify-between gap-3 rounded-md border p-3"
      >
        <div className="flex flex-col gap-0.5">
          <span className="text-foreground text-xs font-medium">
            Confirm before destructive operations
          </span>
          <span className="text-muted-foreground text-[11px]">
            Force push, drop, reset and similar actions will ask before running.
          </span>
        </div>
        <Switch.Root
          id="settings-confirm-destructive"
          checked={watchedConfirm}
          onCheckedChange={(next: boolean) => {
            setValue('confirmDestructiveOps', next, { shouldDirty: true });
          }}
          aria-label="Confirm before destructive operations"
        >
          <Switch.Thumb />
        </Switch.Root>
      </label>

      <div className="flex justify-end gap-2 pt-1">
        <Button
          type="button"
          variant="ghost"
          onClick={handleResetDefaults}
        >
          Reset defaults
        </Button>
        <Button
          type="submit"
          disabled={!isDirty}
          leftIcon={<Save aria-hidden="true" className="size-4" />}
        >
          Save
        </Button>
      </div>
    </form>
  );
};

SettingsForm.displayName = 'SettingsForm';

export const SettingsDialog: FC<SettingsDialogProps> = ({
  open,
  onOpenChange
}) => {
  const handleOpenChange = useCallback(
    (next: boolean) => {
      onOpenChange(next);
    },
    [onOpenChange]
  );

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Content
          title="Settings"
          description="Global preferences for git-pawl. Saved locally and applied to all repositories."
        >
          <SettingsForm onSuccess={() => onOpenChange(false)} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

SettingsDialog.displayName = 'SettingsDialog';