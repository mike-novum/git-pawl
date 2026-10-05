import { shellOpenAgent } from '@/shared/api';

import type { AvailableAgent } from '../ui/types';

export type OpenInAgentInput = {
  path: string;
  agentId: string;
};

export type OpenInAgentResult = void;

export const openInAgent = async (
  input: OpenInAgentInput,
  agents: AvailableAgent[]
): Promise<OpenInAgentResult> => {
  if (!input.path) {
    throw new Error('path is required');
  }
  const target = agents.find((agent) => agent.id === input.agentId);
  if (!target) {
    throw new Error(`Agent not available: ${input.agentId}`);
  }
  if (!target.available) {
    throw new Error(`Agent "${target.name}" is not installed`);
  }
  await shellOpenAgent({ path: input.path, agentId: input.agentId });
};