import type { FC } from 'react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Save } from 'lucide-react';

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Select,
  Switch,
  useToast
} from '@/shared/ui';

import { zodResolver } from '../lib';
import { useGlobalSettings } from '../model';

import type { SettingsGeneralValues } from './types';

const THEME_OPTIONS = [
  { value: 'dark', label: 'Dark' },
  { value: 'light', label: 'Light' },
  { value: 'system', label: 'Follow system' }
] as const;

const DIFF_OPTIONS = [
  { value: 'unified', label: 'Unified' },
  { value: 'split', label: 'Side by side' }
] as const;

const generalSchema = z.object({
  theme: z.union([z.literal('dark'), z.literal('light'), z.literal('system')]),
  diffViewMode: z.union([z.literal('unified'), z.literal('split')]),
  confirmDestructiveOps: z.boolean()
});

export const SettingsGeneralTab: FC = () => {
  const toast = useToast();
  const { values, setValues } = useGlobalSettings();

  const {
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { isDirty }
  } = useForm<SettingsGeneralValues>({
    defaultValues: {
      theme: values.theme,
      diffViewMode: values.diffViewMode,
      confirmDestructiveOps: values.confirmDestructiveOps
    },
    resolver: zodResolver(generalSchema)
  });

  const watchedTheme = watch('theme');
  const watchedDiff = watch('diffViewMode');
  const watchedConfirm = watch('confirmDestructiveOps');

  useEffect(() => {
    reset({
      theme: values.theme,
      diffViewMode: values.diffViewMode,
      confirmDestructiveOps: values.confirmDestructiveOps
    });
  }, [values, reset]);

  const onSubmit = handleSubmit((next) => {
    setValues({
      ...values,
      theme: next.theme,
      diffViewMode: next.diffViewMode,
      confirmDestructiveOps: next.confirmDestructiveOps
    });
    toast.success({ title: 'Settings saved' });
  });

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>General</CardTitle>
        <CardDescription>
          Application preferences for theme, diff rendering and confirmation prompts.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="settings-general-theme"
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
                const safe =
                  next === 'dark' || next === 'light' || next === 'system'
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
              htmlFor="settings-general-diff"
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
            htmlFor="settings-general-confirm-destructive"
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
              id="settings-general-confirm-destructive"
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
              type="submit"
              disabled={!isDirty}
              leftIcon={<Save aria-hidden="true" className="size-4" />}
            >
              Save
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

SettingsGeneralTab.displayName = 'SettingsGeneralTab';