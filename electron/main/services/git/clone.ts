import { spawn } from 'node:child_process';
import { mkdir, rm } from 'node:fs/promises';
import { dirname, isAbsolute, resolve } from 'node:path';

import type { GitCloneArgs } from '../../../shared/schemas';

export const buildAuthedUrl = (url: string, token?: string): string => {
  if (!token) return url;
  const httpsMatch = url.match(/^(https?:\/\/)(.+)$/);
  if (!httpsMatch) return url;
  return `${httpsMatch[1]}oauth2:${token}@${httpsMatch[2]}`;
};

export const parseCloneProgress = (line: string): string | null => {
  const trimmed = line.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('Cloning into')) return trimmed;
  if (trimmed.startsWith('remote:')) return trimmed;
  if (trimmed.startsWith('Receiving objects:')) return trimmed;
  if (trimmed.startsWith('Resolving deltas:')) return trimmed;
  if (trimmed.startsWith('Updating files:')) return trimmed;
  return null;
};

export type GitCloneOptions = {
  token?: string;
  signal?: AbortSignal;
};

const cleanupPartial = async (dest: string): Promise<void> => {
  await rm(dest, { recursive: true, force: true });
};

export const gitClone = async (
  args: GitCloneArgs,
  onProgress?: (msg: string) => void,
  options: GitCloneOptions = {}
): Promise<void> => {
  const dest = isAbsolute(args.destPath) ? args.destPath : resolve(args.destPath);
  await mkdir(dirname(dest), { recursive: true });

  const targetUrl = buildAuthedUrl(args.url, options.token);
  const gitArgs = ['clone', '--progress', targetUrl, dest];

  return new Promise<void>((resolvePromise, rejectPromise) => {
    const proc = spawn('git', gitArgs, { stdio: ['ignore', 'pipe', 'pipe'] });
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
      const text = chunk.toString();
      stderrBuf += text;
      if (!onProgress) return;
      for (const part of text.split(/\r|\n/)) {
        const parsed = parseCloneProgress(part);
        if (parsed) onProgress(parsed);
      }
    });

    proc.on('error', (err: Error) => {
      settle(() => rejectPromise(err));
    });

    proc.on('close', (code: number | null) => {
      if (code === 0) {
        settle(() => resolvePromise());
        return;
      }
      cleanupPartial(dest).catch(() => undefined);
      const detail = stderrBuf.trim() || stdoutBuf.trim() || `git clone exited with code ${code ?? 'null'}`;
      settle(() => rejectPromise(new Error(`git clone failed (code ${code ?? 'null'}): ${detail}`)));
    });

    if (options.signal) {
      const onAbort = (): void => {
        proc.kill('SIGTERM');
        cleanupPartial(dest).catch(() => undefined);
        settle(() => rejectPromise(new Error('git clone aborted')));
      };
      if (options.signal.aborted) {
        onAbort();
        return;
      }
      options.signal.addEventListener('abort', onAbort, { once: true });
    }
  });
};