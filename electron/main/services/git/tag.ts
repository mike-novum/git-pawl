import { execFile, type ExecException } from 'node:child_process';
import { promisify } from 'node:util';

import type { GitTagArgs } from '../../../shared/schemas';
import type { GitTagListResult } from '../../../shared/types/git';

const execFileAsync = promisify(execFile);

export type GitTagResult = GitTagListResult | void;

const TAG_FORMAT = '%(refname:short)|%(objecttype)|%(*objectname)|%(objectname)';

const requireName = (name: string | undefined, action: string): string => {
  if (!name || name.length === 0) {
    throw new Error(`name is required for tag ${action}`);
  }
  return name;
};

type ExecResult = { stdout: string; stderr: string; exitCode: number };

const runGit = async (args: string[], repoPath: string): Promise<ExecResult> => {
  try {
    const result = await execFileAsync('git', args, {
      cwd: repoPath,
      maxBuffer: 16 * 1024 * 1024
    });
    return {
      stdout: typeof result.stdout === 'string' ? result.stdout : '',
      stderr: typeof result.stderr === 'string' ? result.stderr : '',
      exitCode: 0
    };
  } catch (error) {
    const execError = error as ExecException & { stderr?: string; stdout?: string };
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
  const detail = result.stderr.trim() || `git ${args[0]} failed with exit ${result.exitCode}`;
  return new Error(`git ${args[0]} failed (exit ${result.exitCode}): ${detail}`);
};

const parseTagLine = (line: string): GitTagListResult[number] | null => {
  const trimmed = line.trim();
  if (trimmed.length === 0) {
    return null;
  }
  const [name, objectType, peeled, target] = trimmed.split('|');
  if (!name) {
    return null;
  }
  return {
    name,
    type: objectType === 'tag' ? 'annotated' : 'lightweight',
    target: peeled && peeled.length > 0 ? peeled : (target ?? '')
  };
};

export const gitTag = async (args: GitTagArgs): Promise<GitTagResult> => {
  if (args.action === 'list') {
    const gitArgs = ['tag', `--format=${TAG_FORMAT}`, '-l'];
    const result = await runGit(gitArgs, args.repoPath);
    if (result.exitCode !== 0) {
      throw buildError(gitArgs, result);
    }
    return result.stdout
      .split('\n')
      .map(parseTagLine)
      .filter((entry): entry is GitTagListResult[number] => entry !== null);
  }

  if (args.action === 'create') {
    const name = requireName(args.name, 'create');
    const gitArgs = ['tag'];
    if (args.annotated) {
      gitArgs.push('-a', name);
      if (args.message && args.message.length > 0) {
        gitArgs.push('-m', args.message);
      } else {
        gitArgs.push('-m', name);
      }
    } else {
      gitArgs.push(name);
    }
    if (args.target && args.target.length > 0) {
      gitArgs.push(args.target);
    }
    const result = await runGit(gitArgs, args.repoPath);
    if (result.exitCode !== 0) {
      throw buildError(gitArgs, result);
    }
    return;
  }

  const name = requireName(args.name, 'delete');
  const gitArgs = ['tag', '-d', name];
  const result = await runGit(gitArgs, args.repoPath);
  if (result.exitCode !== 0) {
    throw buildError(gitArgs, result);
  }
  return;
};