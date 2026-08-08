import { execFile } from 'node:child_process';
import { stat } from 'node:fs/promises';
import { shell } from 'electron';
import { promisify } from 'node:util';

import type { ShellOpenFinderArgs, ShellOpenTerminalArgs } from '../../shared/schemas';

const execFileAsync = promisify(execFile);

export const openTerminal = async ({ path: dirPath }: ShellOpenTerminalArgs): Promise<void> => {
  if (process.platform !== 'darwin') {
    throw new Error('openTerminal is only supported on macOS');
  }

  try {
    const info = await stat(dirPath);
    if (!info.isDirectory()) {
      throw new Error(`Path is not a directory: ${dirPath}`);
    }
  } catch (error) {
    const code = (error as { code?: string }).code;
    if (code === 'ENOENT') {
      throw new Error(`Directory does not exist: ${dirPath}`);
    }
    throw error;
  }

  const script = `tell application "Terminal"
  do script "cd " & quoted form of "${dirPath}"
  activate
end tell`;

  try {
    await execFileAsync('osascript', ['-e', script]);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to open Terminal: ${message}`);
  }
};

export const openInFinder = async ({ path: dirPath }: ShellOpenFinderArgs): Promise<void> => {
  try {
    const info = await stat(dirPath);
    if (!info.isDirectory()) {
      throw new Error(`Path is not a directory: ${dirPath}`);
    }
  } catch (error) {
    const code = (error as { code?: string }).code;
    if (code === 'ENOENT') {
      throw new Error(`Directory does not exist: ${dirPath}`);
    }
    throw error;
  }

  const result = await shell.openPath(dirPath);
  if (result) {
    throw new Error(`Failed to open Finder: ${result}`);
  }
};
