import { shellOpenTerminal } from '@/shared/api';

export type OpenInTerminalInput = {
  path: string;
};

export type OpenInTerminalResult = void;

export const openInTerminal = async (input: OpenInTerminalInput): Promise<OpenInTerminalResult> => {
  if (!input.path) {
    throw new Error('path is required');
  }
  await shellOpenTerminal({ path: input.path });
};
