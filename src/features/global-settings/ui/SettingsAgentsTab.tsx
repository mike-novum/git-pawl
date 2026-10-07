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
  useToast
} from '@/shared/ui';

import { zodResolver } from '../lib';
import { useGlobalSettings } from '../model';

import type { SettingsAgentsValues } from './types';

const AGENT_OPTIONS = [
  { value: 'claude', label: 'Claude' },
  { value: 'cursor', label: 'Cursor' },
  { value: 'opencode', label: 'OpenCode' },
  { value: 'kilo', label: 'Kilo' },
  { value: 'kimi', label: 'Kimi' },
  { value: 'qwen', label: 'Qwen' }
] as const;

const isAgentOptionValue = (
  value: string
): value is (typeof AGENT_OPTIONS)[number]['value'] =>
  AGENT_OPTIONS.some((option) => option.value === value);

const agentsSchema = z.object({
  defaultAgent: z.union([
    z.literal('claude'),
    z.literal('cursor'),
    z.literal('opencode'),
    z.literal('kilo'),
    z.literal('kimi'),
    z.literal('qwen')
  ])
});

export const SettingsAgentsTab: FC = () => {
  const toast = useToast();
  const { values, setValues } = useGlobalSettings();

  const {
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { isDirty }
  } = useForm<SettingsAgentsValues>({
    defaultValues: {
      defaultAgent: values.defaultAgent
    },
    resolver: zodResolver(agentsSchema)
  });

  const watchedAgent = watch('defaultAgent');

  useEffect(() => {
    reset({ defaultAgent: values.defaultAgent });
  }, [values, reset]);

  const onSubmit = handleSubmit((next) => {
    setValues({
      ...values,
      defaultAgent: next.defaultAgent
    });
    toast.success({ title: 'Settings saved' });
  });

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Agents</CardTitle>
        <CardDescription>
          Choose the default CLI agent launched from the agent menu.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="settings-agents-default-agent"
              className="text-foreground text-xs font-medium"
            >
              Default agent
            </label>
            <Select
              options={AGENT_OPTIONS.map((option) => ({
                value: option.value,
                label: option.label
              }))}
              value={watchedAgent}
              onValueChange={(next) => {
                if (typeof next === 'string' && isAgentOptionValue(next)) {
                  setValue('defaultAgent', next, { shouldDirty: true });
                }
              }}
              placeholder="Pick agent"
              className="w-full"
            />
            <span className="text-muted-foreground text-[11px]">
              Launched when you click the agent button. Right-click to pick another.
            </span>
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

SettingsAgentsTab.displayName = 'SettingsAgentsTab';