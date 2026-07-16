import type { GitStashArgs } from '../../../shared/schemas';

import { runGit } from './runner';

const STASH_REF_PATTERN = /^stash@\{(\d+)\}$/;

export const parseStashRef = (ref: string): string | undefined => {
  if (STASH_REF_PATTERN.test(ref)) return ref;
  return undefined;
};

export const gitStash = async (args: GitStashArgs): Promise<void> => {
  const { repoPath, action, message, ref } = args;
  const commandArgs: string[] = ['stash'];

  switch (action) {
    case 'push':
      commandArgs.push('push');
      if (message) commandArgs.push('-m', message);
      break;
    case 'pop':
    case 'apply':
    case 'drop':
      commandArgs.push(action);
      if (ref) {
        const parsed = parseStashRef(ref);
        if (!parsed) {
          throw new Error(`Invalid stash ref: ${ref}`);
        }
        commandArgs.push(parsed);
      }
      break;
  }

  await runGit(commandArgs, repoPath);
};