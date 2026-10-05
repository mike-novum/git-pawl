import { Bot } from 'lucide-react';
import { useCallback, useMemo } from 'react';
import type { FC } from 'react';

import { useGlobalSettings } from '@/features/global-settings';
import { useToast } from '@/shared/ui';

import { openInAgent, useAvailableAgents } from '../model';

import { AgentMenu } from './AgentMenu';
import type { OpenInAgentProps } from './types';

const TRIGGER_CLASS =
  'text-muted-foreground hover:bg-surface-elevated hover:text-foreground flex size-8 items-center justify-center rounded-md transition-colors duration-(--duration-fast) disabled:opacity-50';

const DEFAULT_AGENT_FALLBACK = 'claude';

const resolveDefaultAgentId = (
  configured: string,
  availableIds: string[]
): string | null => {
  if (availableIds.includes(configured)) {
    return configured;
  }
  if (availableIds.includes(DEFAULT_AGENT_FALLBACK)) {
    return DEFAULT_AGENT_FALLBACK;
  }
  return availableIds[0] ?? null;
};

export const OpenInAgent: FC<OpenInAgentProps> = ({ path, className }) => {
  const toast = useToast();
  const agentsQuery = useAvailableAgents();
  const { values: settings } = useGlobalSettings();

  const agents = useMemo(() => agentsQuery.data ?? [], [agentsQuery.data]);
  const availableAgents = useMemo(
    () => agents.filter((agent) => agent.available),
    [agents]
  );
  const defaultAgentId = useMemo(
    () =>
      resolveDefaultAgentId(
        settings.defaultAgent,
        availableAgents.map((agent) => agent.id)
      ),
    [settings.defaultAgent, availableAgents]
  );

  const launch = useCallback(
    (agentId: string): void => {
      if (!path) return;
      void openInAgent({ path, agentId }, agents)
        .then(() => {
          const agent = agents.find((item) => item.id === agentId);
          toast.success({
            title: `${agent?.name ?? 'Agent'} opened in Terminal`
          });
        })
        .catch((err: unknown) => {
          toast.error({
            title: 'Failed to open agent',
            description: err instanceof Error ? err.message : String(err)
          });
        });
    },
    [path, agents, toast]
  );

  const handleClick = (): void => {
    if (!defaultAgentId) {
      toast.info({
        title: 'No CLI agents detected',
        description:
          'Install claude, cursor, opencode, kilo, kimi or qwen to enable this action.'
      });
      return;
    }
    launch(defaultAgentId);
  };

  const isLoading = agentsQuery.isLoading && agents.length === 0;
  const isButtonDisabled = !path || isLoading;
  const defaultAgentName =
    agents.find((agent) => agent.id === defaultAgentId)?.name ?? 'agent';

  const triggerClass = className ?? TRIGGER_CLASS;
  const triggerAriaLabel = defaultAgentId
    ? `Open in ${defaultAgentName}`
    : 'Open in agent';
  const triggerTitle = defaultAgentId
    ? `Open in ${defaultAgentName} (right-click for more)`
    : 'No CLI agents detected';

  const button = (
    <button
      type="button"
      aria-label={triggerAriaLabel}
      title={triggerTitle}
      onClick={handleClick}
      disabled={isButtonDisabled}
      className={triggerClass}
    >
      <Bot aria-hidden="true" className="size-4" />
    </button>
  );

  if (availableAgents.length === 0 && !isLoading) {
    return button;
  }

  return (
    <AgentMenu
      agents={agents}
      defaultAgentId={defaultAgentId}
      onSelect={launch}
      trigger={button}
    />
  );
};

OpenInAgent.displayName = 'OpenInAgent';