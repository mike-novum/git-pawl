import { writeFile, unlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';

import type { GitCommitArgs } from '../../../shared/schemas';
import type { CommitResult } from '../../../shared/types/git';

import { formatCommitMessage, needsMessageFile } from './commit-format';
import { runGit } from './runner';

const writeMessageFile = async (content: string): Promise<string> => {
  const path = join(tmpdir(), `git-pawl-commit-${randomUUID()}.txt`);
  await writeFile(path, content, 'utf8');
  return path;
};

const removeFile = async (path: string): Promise<void> => {
  await unlink(path).catch(() => undefined);
};

export const gitCommit = async (args: GitCommitArgs): Promise<CommitResult> => {
  const { repoPath, message, files, author, noVerify } = args;
  let messageFile: string | undefined;

  try {
    if (files && files.length > 0) {
      await runGit(['add', ...files], repoPath);
    }

    const formatted = formatCommitMessage(message);
    const commitArgs: string[] = [];

    if (needsMessageFile(formatted)) {
      messageFile = await writeMessageFile(formatted);
      commitArgs.push('-F', messageFile);
    } else {
      commitArgs.push('-m', formatted);
    }

    if (author) {
      commitArgs.push(`--author=${author}`);
    }

    if (noVerify) {
      commitArgs.push('--no-verify');
    }

    const { stdout, stderr } = await runGit(['commit', ...commitArgs], repoPath);
    const hashResult = await runGit(['rev-parse', 'HEAD'], repoPath);

    return {
      hash: hashResult.stdout.trim(),
      stdout,
      stderr
    };
  } finally {
    if (messageFile) {
      await removeFile(messageFile);
    }
  }
};