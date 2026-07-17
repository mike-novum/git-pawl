import { execFile, type ExecException } from 'node:child_process';
import { existsSync } from 'node:fs';
import { promisify } from 'node:util';

import type { GitHooksArgs } from '../../../shared/schemas';

const execFileAsync = promisify(execFile);

const KNOWN_HOOKS = [
  'applypatch-msg',
  'commit-msg',
  'fsmonitor-watchman',
  'post-update',
  'pre-applypatch',
  'pre-commit',
  'pre-merge-commit',
  'pre-push',
  'pre-rebase',
  'pre-receive',
  'prepare-commit-msg',
  'push-to-checkout',
  'update'
] as const;

type HookName = (typeof KNOWN_HOOKS)[number];

export type HooksResult = Record<HookName, boolean>;

type ExecResult = { stdout: string; stderr: string; exitCode: number };

const runGit = async (
  args: string[],
  repoPath: string
): Promise<ExecResult> => {
  try {
    const result = await execFileAsync('git', args, {
      cwd: repoPath,
      maxBuffer: 4 * 1024 * 1024
    });
    return {
      stdout: typeof result.stdout === 'string' ? result.stdout : '',
      stderr: typeof result.stderr === 'string' ? result.stderr : '',
      exitCode: 0
    };
  } catch (error) {
    const execError = error as ExecException & {
      stderr?: string;
      stdout?: string;
    };
    return {
      stdout: typeof execError.stdout === 'string' ? execError.stdout : '',
      stderr:
        typeof execError.stderr === 'string'
          ? execError.stderr
          : error instanceof Error
            ? error.message
            : String(error),
      exitCode: typeof execError.code === 'number' ? execError.code : 1
    };
  }
};

const buildError = (args: string[], result: ExecResult): Error => {
  const detail =
    result.stderr.trim() || `git ${args[0]} failed with exit ${result.exitCode}`;
  return new Error(`git ${args[0]} failed (exit ${result.exitCode}): ${detail}`);
};

export const listHooks = async (args: GitHooksArgs): Promise<HooksResult> => {
  const result: HooksResult = KNOWN_HOOKS.reduce(
    (acc, hook) => {
      acc[hook] = false;
      return acc;
    },
    {} as HooksResult
  );

  const gitArgs = ['rev-parse', '--git-path', 'hooks'];
  const pathResult = await runGit(gitArgs, args.repoPath);
  if (pathResult.exitCode !== 0) {
    throw buildError(gitArgs, pathResult);
  }

  const hooksDir = pathResult.stdout.trim();

  for (const hook of KNOWN_HOOKS) {
    result[hook] = existsSync(`${hooksDir}/${hook}`);
  }

  return result;
};