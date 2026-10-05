import type { ReactElement } from 'react';

import type { AgentDescriptor } from '@electron/preload';

export type AvailableAgent = AgentDescriptor;

export type OpenInAgentProps = {
  path: string;
  className?: string;
};

export type AgentMenuProps = {
  agents: AvailableAgent[];
  defaultAgentId: string | null;
  onSelect: (agentId: string) => void;
  trigger: ReactElement<Record<string, unknown>>;
};