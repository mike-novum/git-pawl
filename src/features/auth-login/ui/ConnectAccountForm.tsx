import { useMemo } from 'react';
import type { FC } from 'react';
import {
  useForm,
  type FieldErrors,
  type FieldValues,
  type Resolver
} from 'react-hook-form';
import { AlertCircle } from 'lucide-react';
import { z } from 'zod';

import type { AccountProvider } from '@/entities/account';

import { Button, Input, Tabs, useToast } from '@/shared/ui';

import { useConnectAccount } from '../model';

import type { ConnectAccountFormProps, ConnectAccountFormValues } from './types';

const formSchema = z.object({
  provider: z.union([z.literal('github'), z.literal('gitlab')]),
  token: z.string().trim().min(1, 'Token is required'),
  baseUrl: z.string().trim()
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

export const ConnectAccountForm: FC<ConnectAccountFormProps> = ({ onSuccess }) => {
  const toast = useToast();
  const { mutate, isPending, error, reset } = useConnectAccount();

  const defaultValues = useMemo<ConnectAccountFormValues>(
    () => ({ provider: 'github', token: '', baseUrl: '' }),
    []
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<ConnectAccountFormValues>({
    defaultValues,
    resolver: zodResolver(formSchema)
  });

  const provider = watch('provider');

  const onSubmit = handleSubmit((values) => {
    const trimmedBaseUrl = values.baseUrl.trim();
    const payload = {
      provider: values.provider,
      token: values.token.trim(),
      ...(trimmedBaseUrl.length > 0 ? { baseUrl: trimmedBaseUrl } : {})
    };

    mutate(payload, {
      onSuccess: (account) => {
        toast.success({
          title: 'Account connected',
          description: `${account.provider === 'github' ? 'GitHub' : 'GitLab'} @${account.login}`
        });
        reset();
        onSuccess?.();
      }
    });
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <Tabs.Root
        value={provider}
        onValueChange={(value) =>
          setValue(
            'provider',
            (value as AccountProvider) ?? 'github',
            { shouldValidate: false, shouldDirty: true }
          )
        }
      >
        <Tabs.List className="w-full">
          <Tabs.Trigger value="github" className="flex-1">
            GitHub
          </Tabs.Trigger>
          <Tabs.Trigger value="gitlab" className="flex-1">
            GitLab
          </Tabs.Trigger>
        </Tabs.List>
      </Tabs.Root>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="connect-account-token"
          className="text-foreground text-xs font-medium"
        >
          Personal access token
        </label>
        <Input
          id="connect-account-token"
          type="password"
          autoComplete="off"
          placeholder={provider === 'github' ? 'ghp_... or github_pat_...' : 'glpat-...'}
          disabled={isPending}
          aria-invalid={Boolean(errors.token)}
          {...register('token')}
        />
        {errors.token?.message && (
          <p className="text-destructive flex items-center gap-1 text-xs">
            <AlertCircle className="size-3" />
            {errors.token.message}
          </p>
        )}
      </div>

      {provider === 'gitlab' && (
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="connect-account-base-url"
            className="text-foreground text-xs font-medium"
          >
            Base URL <span className="text-muted-foreground">(optional)</span>
          </label>
          <Input
            id="connect-account-base-url"
            type="url"
            autoComplete="off"
            placeholder="https://gitlab.com"
            disabled={isPending}
            aria-invalid={Boolean(errors.baseUrl)}
            {...register('baseUrl')}
          />
          {errors.baseUrl?.message && (
            <p className="text-destructive flex items-center gap-1 text-xs">
              <AlertCircle className="size-3" />
              {errors.baseUrl.message}
            </p>
          )}
        </div>
      )}

      {error && (
        <div className="border-destructive/40 bg-destructive/10 text-destructive flex items-start gap-2 rounded-md border px-3 py-2 text-xs">
          <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
          <span>{error.message}</span>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-1">
        <Button type="submit" disabled={isPending} loading={isPending}>
          Connect account
        </Button>
      </div>
    </form>
  );
};

ConnectAccountForm.displayName = 'ConnectAccountForm';
