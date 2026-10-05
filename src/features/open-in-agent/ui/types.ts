import type { AgentDescriptor } from '@electron/preload';

export type AvailableAgent = AgentDescriptor;

export type OpenInAgentProps = {
  path: string;
  className?: string;
};

export type AgentMenuProps = {
  agents: AvailableAgent[];
  defaultAgentId: string | null;
  open: boolean;
  onOpenChange: (next: boolean) => void;
  onSelect: (agentId: string) => void;
};