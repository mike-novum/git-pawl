import { execFile, type ExecException } from 'node:child_process';
import { existsSync, statSync } from 'node:fs';
import { isAbsolute, resolve } from 'node:path';
import { promisify } from 'node:util';

import type { GitPatchArgs } from '../../../shared/schemas';

const execFileAsync = promisify(execFile);

export type GitPatchResult = { files: string[] };

type ExecResult = { stdout: string; stderr: string; exitCode: number };

const runGit = async (
  args: string[],
  repoPath: string
): Promise<ExecResult> => {
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

const ensureDir = (destDir: string): string => {
  const absolute = isAbsolute(destDir) ? destDir : resolve(destDir);
  if (!existsSync(absolute)) {
    throw new Error(`destDir does not exist: ${absolute}`);
  }
  const stats = statSync(absolute);
  if (!stats.isDirectory()) {
    throw new Error(`destDir is not a directory: ${absolute}`);
  }
  return absolute;
};

export const createPatch = async (
  args: GitPatchArgs
): Promise<GitPatchResult> => {
  const destDir = ensureDir(args.destDir ?? '');
  const gitArgs = ['format-patch', '-o', destDir];
  if (args.range && args.range.length > 0) {
    gitArgs.push(args.range);
  } else {
    gitArgs.push('HEAD');
  }
  const result = await runGit(gitArgs, args.repoPath);
  if (result.exitCode !== 0) {
    throw buildError(gitArgs, result);
  }
  const files = result.stdout
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.endsWith('.patch') || line.endsWith('.mbox'));
  return { files };
};

export const applyPatch = async (args: GitPatchArgs): Promise<void> => {
  if (!args.file || args.file.length === 0) {
    throw new Error('file is required for applyPatch');
  }
  const absolute = isAbsolute(args.file) ? args.file : resolve(args.file);
  if (!existsSync(absolute)) {
    throw new Error(`patch file does not exist: ${absolute}`);
  }
  const gitArgs = ['am', absolute];
  const result = await runGit(gitArgs, args.repoPath);
  if (result.exitCode === 0) {
    return;
  }
  if (args.threeWay) {
    const fallbackArgs = ['apply', '--3way', absolute];
    const fallback = await runGit(fallbackArgs, args.repoPath);
    if (fallback.exitCode !== 0) {
      throw buildError(fallbackArgs, fallback);
    }
    return;
  }
  const applyArgs = ['apply', absolute];
  const applyResult = await runGit(applyArgs, args.repoPath);
  if (applyResult.exitCode !== 0) {
    throw buildError(applyArgs, applyResult);
  }
};