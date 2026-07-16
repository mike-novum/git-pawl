import type { GitMergeArgs } from '../../../shared/schemas';

import { runGit } from './runner';

export const gitMerge = async (args: GitMergeArgs): Promise<void> => {
  const { repoPath, branch, noFF, message } = args;
  const commandArgs: string[] = ['merge'];

  if (noFF) commandArgs.push('--no-ff');
  if (message) commandArgs.push('-m', message);
  commandArgs.push(branch);

  await runGit(commandArgs, repoPath);
};