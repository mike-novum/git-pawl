import { spawn } from 'node:child_process';
import { existsSync, statSync } from 'node:fs';
import { isAbsolute, resolve } from 'node:path';

import type {
  GitFetchArgs,
  GitPullArgs,
  GitPushArgs
} from '../../../shared/schemas';

import { buildAuthedUrl } from './clone';

export type GitNetworkOptions = {
  token?: string;
  signal?: AbortSignal;
};

const assertRepoPath = (repoPath: string): string => {
  const abs = isAbsolute(repoPath) ? repoPath : resolve(repoPath);
  if (!existsSync(abs)) {
    throw new Error(`Repository path does not exist: ${abs}`);
  }
  const stat = statSync(abs);
  if (!stat.isDirectory()) {
    throw new Error(`Repository path is not a directory: ${abs}`);
  }
  return abs;
};

const runGit = (
  args: string[],
  cwd: string,
  signal: AbortSignal | undefined
): Promise<void> =>
  new Promise<void>((resolvePromise, rejectPromise) => {
    const proc = spawn('git', args, {
      cwd,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, GIT_TERMINAL_PROMPT: '0' }
    });
    let stderrBuf = '';
    let stdoutBuf = '';
    let settled = false;

    const settle = (fn: () => void): void => {
      if (settled) return;
      settled = true;
      fn();
    };

    proc.stdout.on('data', (chunk: Buffer) => {
      stdoutBuf += chunk.toString();
    });
    proc.stderr.on('data', (chunk: Buffer) => {
      stderrBuf += chunk.toString();
    });

    proc.on('error', (err: Error) => {
      settle(() => rejectPromise(err));
    });

    proc.on('close', (code: number | null) => {
      if (code === 0) {
        settle(() => resolvePromise());
        return;
      }
      const detail = stderrBuf.trim() || stdoutBuf.trim() || `git exited with code ${code ?? 'null'}`;
      settle(() => rejectPromise(new Error(`git ${args[0]} failed (code ${code ?? 'null'}): ${detail}`)));
    });

    if (signal) {
      const onAbort = (): void => {
        proc.kill('SIGTERM');
        settle(() => rejectPromise(new Error(`git ${args[0]} aborted`)));
      };
      if (signal.aborted) {
        onAbort();
        return;
      }
      signal.addEventListener('abort', onAbort, { once: true });
    }
  });

const withAuthedRemote = (
  args: string[],
  token: string | undefined
): string[] => {
  if (!token) return args;
  const authedRemoteIdx = args.findIndex(
    (arg, idx) => idx > 0 && !arg.startsWith('-') && /^https?:\/\//.test(arg)
  );
  if (authedRemoteIdx === -1) return args;
  const gitArgs = [...args];
  gitArgs[authedRemoteIdx] = buildAuthedUrl(args[authedRemoteIdx] as string, token);
  return gitArgs;
};

export const gitFetch = async (
  args: GitFetchArgs,
  options: GitNetworkOptions = {}
): Promise<void> => {
  const repoPath = assertRepoPath(args.repoPath);
  const gitArgs = ['fetch', '--progress', ...(args.remote ? [args.remote] : [])];
  const finalArgs = withAuthedRemote(gitArgs, options.token);
  await runGit(finalArgs, repoPath, options.signal);
};

export const gitPull = async (
  args: GitPullArgs,
  options: GitNetworkOptions = {}
): Promise<void> => {
  const repoPath = assertRepoPath(args.repoPath);
  const gitArgs = ['pull', '--progress'];
  if (args.remote) gitArgs.push(args.remote);
  if (args.branch) gitArgs.push(args.branch);
  const finalArgs = withAuthedRemote(gitArgs, options.token);
  await runGit(finalArgs, repoPath, options.signal);
};

export const gitPush = async (
  args: GitPushArgs,
  options: GitNetworkOptions = {}
): Promise<void> => {
  const repoPath = assertRepoPath(args.repoPath);
  const gitArgs = ['push', '--progress'];
  if (args.remote) gitArgs.push(args.remote);
  if (args.branch) gitArgs.push(args.branch);
  const finalArgs = withAuthedRemote(gitArgs, options.token);
  await runGit(finalArgs, repoPath, options.signal);
};