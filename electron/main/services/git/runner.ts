import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

type ExecError = {
  stdout?: string;
  stderr?: string;
  message?: string;
};

const formatError = (err: ExecError, args: string[]): Error => {
  const command = `git ${args.join(' ')}`;
  const stderr = err.stderr?.trim() ?? '';
  const stdout = err.stdout?.trim() ?? '';
  const detail = stderr || stdout || err.message || 'unknown error';
  return new Error(`${command}: ${detail}`);
};

export const runGit = async (
  args: string[],
  cwd: string
): Promise<{ stdout: string; stderr: string }> => {
  try {
    const result = await execFileAsync('git', args, { cwd });
    return { stdout: result.stdout, stderr: result.stderr };
  } catch (err) {
    throw formatError(err as ExecError, args);
  }
};