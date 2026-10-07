import type { FC } from 'react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { AlertCircle, Save } from 'lucide-react';

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  useToast
} from '@/shared/ui';

import { zodResolver } from '../lib';
import { useGlobalSettings } from '../model';

import type { SettingsGitValues } from './types';

const AUTO_FETCH_MIN = 1;
const AUTO_FETCH_MAX = 1440;

const gitSchema = z.object({
  editor: z.string().trim(),
  autoFetchInterval: z
    .number()
    .int()
    .min(AUTO_FETCH_MIN, `Minimum ${AUTO_FETCH_MIN} minute`)
    .max(AUTO_FETCH_MAX, `Maximum ${AUTO_FETCH_MAX} minutes`)
});

export const SettingsGitTab: FC = () => {
  const toast = useToast();
  const { values, setValues } = useGlobalSettings();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty }
  } = useForm<SettingsGitValues>({
    defaultValues: {
      editor: values.editor,
      autoFetchInterval: values.autoFetchInterval
    },
    resolver: zodResolver(gitSchema)
  });

  useEffect(() => {
    reset({
      editor: values.editor,
      autoFetchInterval: values.autoFetchInterval
    });
  }, [values, reset]);

  const onSubmit = handleSubmit((next) => {
    setValues({
      ...values,
      editor: next.editor.trim(),
      autoFetchInterval: next.autoFetchInterval
    });
    toast.success({ title: 'Settings saved' });
  });

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Git</CardTitle>
        <CardDescription>
          Defaults applied to git operations and background syncing.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="settings-git-editor"
              className="text-foreground text-xs font-medium"
            >
              Default editor{' '}
              <span className="text-muted-foreground">(git core.editor)</span>
            </label>
            <Input
              id="settings-git-editor"
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
              htmlFor="settings-git-auto-fetch"
              className="text-foreground text-xs font-medium"
            >
              Auto-fetch interval (minutes)
            </label>
            <Input
              id="settings-git-auto-fetch"
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

SettingsGitTab.displayName = 'SettingsGitTab';