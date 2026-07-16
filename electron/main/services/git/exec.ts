import { spawn } from 'node:child_process';
import type { Readable } from 'node:stream';

export type ExecResult = {
  stdout: string;
  stderr: string;
  exitCode: number;
};

export type ExecOptions = {
  cwd: string;
  signal?: AbortSignal;
  env?: Record<string, string | undefined>;
  stdin?: string;
};

const GIT_BIN = 'git';

const collectOutput = (stream: Readable): Promise<string> =>
  new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });
    stream.on('end', () => {
      resolve(Buffer.concat(chunks).toString('utf8'));
    });
    stream.on('error', (err) => {
      reject(err);
    });
  });

export const execGit = (args: string[], options: ExecOptions): Promise<ExecResult> => {
  const { cwd, signal, env, stdin } = options;

  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new Error('Aborted'));
      return;
    }

    const child = spawn(GIT_BIN, args, {
      cwd,
      env: env ?? process.env,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    const stdoutPromise = collectOutput(child.stdout).then((value) => {
      stdout = value;
    });
    const stderrPromise = collectOutput(child.stderr).then((value) => {
      stderr = value;
    });

    const onAbort = (): void => {
      child.kill('SIGTERM');
    };

    if (signal) {
      if (signal.aborted) {
        child.kill('SIGTERM');
        reject(new Error('Aborted'));
        return;
      }
      signal.addEventListener('abort', onAbort, { once: true });
    }

    if (stdin !== undefined) {
      child.stdin.end(stdin);
    } else {
      child.stdin.end();
    }

    child.on('error', (err) => {
      signal?.removeEventListener('abort', onAbort);
      reject(err);
    });

    child.on('close', async (code) => {
      signal?.removeEventListener('abort', onAbort);
      try {
        await Promise.all([stdoutPromise, stderrPromise]);
      } catch (err) {
        reject(err);
        return;
      }
      resolve({
        stdout,
        stderr,
        exitCode: code ?? -1
      });
    });
  });
};
