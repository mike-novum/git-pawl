import { spawn } from 'node:child_process';
import { execFile } from 'node:child_process';
import { stat } from 'node:fs/promises';
import { promisify } from 'node:util';

import type {
  AgentDescriptor,
  ShellDetectAgentsResult,
  ShellOpenAgentArgs
} from '../../shared/schemas';

const execFileAsync = promisify(execFile);

const AGENT_DEFINITIONS: Array<{
  id: string;
  name: string;
  command: string;
}> = [
  { id: 'claude', name: 'Claude', command: 'claude' },
  { id: 'cursor', name: 'Cursor', command: 'cursor' },
  { id: 'opencode', name: 'OpenCode', command: 'opencode' },
  { id: 'kilo', name: 'Kilo', command: 'kilo' },
  { id: 'kimi', name: 'Kimi', command: 'kimi' },
  { id: 'qwen', name: 'Qwen', command: 'qwen' }
];

const checkAgent = async (command: string): Promise<string | undefined> => {
  try {
    const { stdout, stderr } = await execFileAsync(command, ['-v'], {
      timeout: 4000
    });
    const output = `${stdout ?? ''}${stderr ?? ''}`.trim();
    if (output.length === 0) return undefined;
    const firstLine = output.split('\n')[0]?.trim() ?? '';
    return firstLine.length > 0 ? firstLine : undefined;
  } catch {
    return undefined;
  }
};

export const detectAgents = async (): Promise<ShellDetectAgentsResult> => {
  const results = await Promise.all(
    AGENT_DEFINITIONS.map(async (def): Promise<AgentDescriptor> => {
      const version = await checkAgent(def.command);
      return {
        id: def.id,
        name: def.name,
        command: def.command,
        available: version !== undefined,
        version
      };
    })
  );
  return results;
};

const findAgent = (
  agents: ShellDetectAgentsResult,
  agentId: string
): AgentDescriptor | undefined => agents.find((agent) => agent.id === agentId);

export const openAgent = async ({
  path: repoPath,
  agentId
}: ShellOpenAgentArgs): Promise<void> => {
  try {
    const info = await stat(repoPath);
    if (!info.isDirectory()) {
      throw new Error(`Path is not a directory: ${repoPath}`);
    }
  } catch (error) {
    const code = (error as { code?: string }).code;
    if (code === 'ENOENT') {
      throw new Error(`Directory does not exist: ${repoPath}`);
    }
    throw error;
  }

  const agents = await detectAgents();
  const agent = findAgent(agents, agentId);
  if (!agent) {
    throw new Error(`Unknown agent: ${agentId}`);
  }
  if (!agent.available) {
    throw new Error(
      `Agent "${agent.name}" is not installed (command "${agent.command}" not found)`
    );
  }

  const child = spawn(agent.command, [repoPath], {
    cwd: repoPath,
    detached: true,
    stdio: 'ignore',
    shell: false
  });

  child.on('error', (error) => {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to launch ${agent.name}: ${message}`);
  });

  child.unref();
};