import { gitStash } from '@/shared/api';

import type { StashEntry } from '../model/types';

export type { StashEntry };

export const PLACEHOLDER_NOTE =
  'git:stash IPC does not yet expose a list action';

export const listStash = async (_repoPath: string): Promise<StashEntry[]> => {
  void _repoPath;
  return [];
};

export const pushStash = (
  repoPath: string,
  message?: string
): Promise<unknown> => {
  const args: { repoPath: string; action: 'push'; message?: string } = {
    repoPath,
    action: 'push'
  };
  if (message) args.message = message;
  return gitStash(args);
};

export const popStash = (
  repoPath: string,
  ref?: string
): Promise<unknown> => {
  const args: { repoPath: string; action: 'pop'; ref?: string } = {
    repoPath,
    action: 'pop'
  };
  if (ref) args.ref = ref;
  return gitStash(args);
};

export const applyStash = (
  repoPath: string,
  ref?: string
): Promise<unknown> => {
  const args: { repoPath: string; action: 'apply'; ref?: string } = {
    repoPath,
    action: 'apply'
  };
  if (ref) args.ref = ref;
  return gitStash(args);
};

export const dropStash = (
  repoPath: string,
  ref?: string
): Promise<unknown> => {
  const args: { repoPath: string; action: 'drop'; ref?: string } = {
    repoPath,
    action: 'drop'
  };
  if (ref) args.ref = ref;
  return gitStash(args);
};
