import type { BranchListResult } from '../../../shared/types/git';
import type { GitBranchArgs } from '../../../shared/schemas';

import { parseBranchList, runGit } from './runner';

export type GitBranchResult = BranchListResult | void;

const requireName = (name: string | undefined, action: string): string => {
  if (!name) {
    throw new Error(`name is required for branch ${action}`);
  }
  return name;
};

export const gitBranch = async (args: GitBranchArgs): Promise<GitBranchResult> => {
  if (args.action === 'list') {
    const { stdout } = await runGit(
      ['branch', '--format=%(refname:short)'],
      args.repoPath
    );
    return parseBranchList(stdout);
  }

  if (args.action === 'create') {
    const name = requireName(args.name, 'create');
    await runGit(['branch', name], args.repoPath);
    return;
  }

  const name = requireName(args.name, 'delete');
  const flag = args.force ? '-D' : '-d';
  await runGit(['branch', flag, name], args.repoPath);
  return;
};