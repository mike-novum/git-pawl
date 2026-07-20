import type { BranchListResult } from '../../../shared/types/git';
import type { GitBranchArgs } from '../../../shared/schemas';

import { runGit } from './runner';

export type GitBranchResult = BranchListResult | void;

const requireName = (name: string | undefined, action: string): string => {
  if (!name) {
    throw new Error(`name is required for branch ${action}`);
  }
  return name;
};

export const parseBranchRefs = (raw: string): BranchListResult =>
  raw
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => {
      const [name = '', target = ''] = line.split('\0');

      return { name, target };
    })
    .filter((branch) => branch.name.length > 0 && branch.target.length > 0);

export const gitBranch = async (args: GitBranchArgs): Promise<GitBranchResult> => {
  if (args.action === 'list') {
    const { stdout } = await runGit(
      ['branch', '--format=%(refname:short)%00%(objectname)'],
      args.repoPath
    );
    return parseBranchRefs(stdout);
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