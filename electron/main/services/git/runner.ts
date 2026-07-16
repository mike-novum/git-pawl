import { execFile, type ExecException } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export type ExecResult = {
  stdout: string;
  stderr: string;
};

const isPlainError = (error: unknown): error is ExecException =>
  typeof error === 'object' &&
  error !== null &&
  'code' in error &&
  'stderr' in error;

export const runGit = async (
  args: string[],
  repoPath: string
): Promise<ExecResult> => {
  if (!repoPath || typeof repoPath !== 'string') {
    throw new Error('repoPath is required');
  }

  try {
    const result = await execFileAsync('git', args, {
      cwd: repoPath,
      maxBuffer: 16 * 1024 * 1024
    });
    return {
      stdout: typeof result.stdout === 'string' ? result.stdout : '',
      stderr: typeof result.stderr === 'string' ? result.stderr : ''
    };
  } catch (error) {
    if (isPlainError(error)) {
      const code = error.code ?? 'unknown';
      const stderr = (error.stderr ?? error.message ?? '').toString().trim();
      throw new Error(`git ${args[0]} failed (exit ${code}): ${stderr}`);
    }
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`git ${args[0]} failed: ${message}`);
  }
};

export const parseBranchList = (raw: string): string[] =>
  raw
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

export const parseCommitHash = (raw: string): string => {
  const trimmed = raw.trim();
  return trimmed.split('\n')[0] ?? '';
};