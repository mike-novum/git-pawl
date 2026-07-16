import { existsSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

import type {
  GitLogArgs,
  GitDiffArgs,
  GitStatusArgs,
  GitRevParseArgs
} from '../../../shared/schemas';
import type {
  GitStatus,
  Commit,
  DiffHunk
} from '../../../shared/types/git';
import { GitError } from '../../../shared/types/git';

import { execGit } from './exec';
import {
  LOG_FORMAT,
  STATUS_PORCELAIN_FLAGS,
  parseDiff,
  parseLog,
  parseStatusPorcelain
} from './parser';

const GIT_DIR = '.git';

const ensureRepoPath = (repoPath: string): string => {
  if (typeof repoPath !== 'string' || repoPath.length === 0) {
    throw new Error('repoPath must be a non-empty string');
  }
  const absolute = resolve(repoPath);
  if (!absolute.startsWith('/')) {
    throw new Error('repoPath must be an absolute path');
  }
  if (!existsSync(absolute)) {
    throw new Error(`Repository path does not exist: ${absolute}`);
  }
  let stats;
  try {
    stats = statSync(absolute);
  } catch {
    throw new Error(`Cannot stat repository path: ${absolute}`);
  }
  if (!stats.isDirectory()) {
    throw new Error(`Repository path is not a directory: ${absolute}`);
  }
  const gitDir = join(absolute, GIT_DIR);
  if (!existsSync(gitDir)) {
    throw new Error(`Not a git repository: ${absolute}`);
  }
  return absolute;
};

const wrapGitError = (params: {
  args: string[];
  cwd: string;
  exitCode: number;
  stdout: string;
  stderr: string;
}): GitError => {
  const message =
    params.stderr.trim().split('\n').at(-1) ??
    `git ${params.args.join(' ')} failed with exit code ${params.exitCode}`;
  return new GitError({
    message,
    args: params.args,
    cwd: params.cwd,
    exitCode: params.exitCode,
    stdout: params.stdout,
    stderr: params.stderr
  });
};

export const gitStatus = async (
  args: GitStatusArgs,
  signal?: AbortSignal
): Promise<GitStatus> => {
  const cwd = ensureRepoPath(args.repoPath);
  const gitArgs = ['status', ...STATUS_PORCELAIN_FLAGS];
  const result = await execGit(gitArgs, { cwd, signal });
  if (result.exitCode !== 0) {
    throw wrapGitError({ args: gitArgs, cwd, ...result });
  }
  return parseStatusPorcelain(result.stdout);
};

export const gitLog = async (
  args: GitLogArgs,
  signal?: AbortSignal
): Promise<Commit[]> => {
  const cwd = ensureRepoPath(args.repoPath);
  const gitArgs = ['log', `--format=${LOG_FORMAT}`, '-z'];
  if (typeof args.maxCount === 'number') {
    gitArgs.push(`-n`, String(args.maxCount));
  }
  const result = await execGit(gitArgs, { cwd, signal });
  if (result.exitCode !== 0) {
    throw wrapGitError({ args: gitArgs, cwd, ...result });
  }
  return parseLog(result.stdout);
};

export const gitDiff = async (
  args: GitDiffArgs,
  signal?: AbortSignal
): Promise<DiffHunk[]> => {
  const cwd = ensureRepoPath(args.repoPath);
  const gitArgs = ['diff'];
  if (args.range && args.range.length > 0) {
    gitArgs.push(args.range);
  }
  const result = await execGit(gitArgs, { cwd, signal });
  if (result.exitCode !== 0) {
    throw wrapGitError({ args: gitArgs, cwd, ...result });
  }
  return parseDiff(result.stdout);
};

export const gitRevParse = async (
  args: GitRevParseArgs,
  signal?: AbortSignal
): Promise<string> => {
  const cwd = ensureRepoPath(args.repoPath);
  const gitArgs = ['rev-parse', 'HEAD'];
  const result = await execGit(gitArgs, { cwd, signal });
  if (result.exitCode !== 0) {
    throw wrapGitError({ args: gitArgs, cwd, ...result });
  }
  return result.stdout.trim();
};
