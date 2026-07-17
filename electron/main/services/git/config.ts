import { execFile, type ExecException } from 'node:child_process';
import { promisify } from 'node:util';

import type { GitConfigArgs } from '../../../shared/schemas';

const execFileAsync = promisify(execFile);

type ExecResult = { stdout: string; stderr: string; exitCode: number };

type ConfigScope = 'local' | 'global' | 'system';

const SCOPE_FLAG: Record<ConfigScope, string> = {
  local: '--local',
  global: '--global',
  system: '--system'
};

type GetConfigArgs = {
  repoPath: string;
  scope?: ConfigScope;
  key?: string;
  list?: boolean;
  unset?: boolean;
  value?: string;
};

type SetConfigArgs = {
  repoPath: string;
  scope?: ConfigScope;
  key: string;
  value: string;
};

type UnsetConfigArgs = {
  repoPath: string;
  scope?: ConfigScope;
  key: string;
  unset?: boolean;
};

const runGit = async (args: string[], repoPath: string): Promise<ExecResult> => {
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

const buildScopeArgs = (
  repoPath: string,
  scope: ConfigScope | undefined,
  base: string[]
): string[] => {
  const args = [...base];
  if (scope) {
    args.push(SCOPE_FLAG[scope]);
  }
  if (scope && scope !== 'local' && repoPath && repoPath.length > 0) {
    args.push('--git-dir', `${repoPath}/.git`);
  }
  return args;
};

const isUnsetError = (stderr: string): boolean =>
  /no such key|does not exist/i.test(stderr);

export const gitGetConfig = async (
  args: GitConfigArgs
): Promise<string | Record<string, string>> => {
  const a = args as GetConfigArgs;
  if (a.list === true || !a.key) {
    const gitArgs = buildScopeArgs(a.repoPath, a.scope, [
      'config',
      '-z',
      '--list'
    ]);
    const result = await runGit(gitArgs, a.repoPath);
    if (result.exitCode !== 0) {
      throw buildError(gitArgs, result);
    }
    const entries: Record<string, string> = {};
    const parts = result.stdout.split('\0');
    for (const part of parts) {
      if (part.length === 0) continue;
      const eqIdx = part.indexOf('=');
      if (eqIdx < 0) continue;
      const key = part.slice(0, eqIdx);
      const value = part.slice(eqIdx + 1);
      entries[key] = value;
    }
    return entries;
  }

  const gitArgs = buildScopeArgs(a.repoPath, a.scope, [
    'config',
    '--get',
    a.key
  ]);
  const result = await runGit(gitArgs, a.repoPath);
  if (result.exitCode !== 0) {
    if (isUnsetError(result.stderr)) {
      return '';
    }
    throw buildError(gitArgs, result);
  }
  return result.stdout.trim();
};

export const gitSetConfig = async (args: GitConfigArgs): Promise<void> => {
  const a = args as SetConfigArgs;
  if (!a.key || typeof a.value !== 'string') {
    throw new Error('key and value are required to set config');
  }
  const gitArgs = buildScopeArgs(a.repoPath, a.scope, [
    'config',
    a.key,
    a.value
  ]);
  const result = await runGit(gitArgs, a.repoPath);
  if (result.exitCode !== 0) {
    throw buildError(gitArgs, result);
  }
};

export const gitUnsetConfig = async (args: GitConfigArgs): Promise<void> => {
  const a = args as UnsetConfigArgs;
  if (!a.key) {
    throw new Error('key is required to unset config');
  }
  const gitArgs = buildScopeArgs(a.repoPath, a.scope, [
    'config',
    '--unset',
    a.key
  ]);
  const result = await runGit(gitArgs, a.repoPath);
  if (result.exitCode !== 0) {
    if (isUnsetError(result.stderr)) {
      return;
    }
    throw buildError(gitArgs, result);
  }
};