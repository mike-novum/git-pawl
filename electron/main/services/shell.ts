import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

import type { ShellOpenTerminalArgs } from '../../shared/schemas';

const execFileAsync = promisify(execFile);

export const openTerminal = async ({ path: dirPath }: ShellOpenTerminalArgs): Promise<void> => {
  if (process.platform !== 'darwin') {
    throw new Error('openTerminal is only supported on macOS');
  }

  const escapedPath = dirPath.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  const script = `tell application "Terminal" to do script "cd \\"${escapedPath}\\""`;

  try {
    await execFileAsync('osascript', ['-e', script]);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to open Terminal: ${message}`);
  }
};
