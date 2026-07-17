import { gitStatus } from '@/shared/api';

import type { FileChange } from '../model/types';

export type { FileChange };

const UNMODIFIED: ReadonlyArray<string> = [' ', '!'];

const isSignificant = (code: string): boolean => !UNMODIFIED.includes(code);

const aggregateStatus = (
  indexCode: string,
  workTreeCode: string
): FileChange['status'] | null => {
  if (isSignificant(indexCode) && isSignificant(workTreeCode)) {
    if (indexCode === '?' && workTreeCode === '?') return '??';
    if (indexCode === '!' && workTreeCode === '!') return '!!';
    if (indexCode === 'R' || workTreeCode === 'R') return 'R';
    return 'M';
  }
  if (isSignificant(indexCode)) {
    if (indexCode === '?') return '??';
    if (indexCode === '!') return '!!';
    if (indexCode === 'R') return 'R';
    if (indexCode === 'A') return 'A';
    if (indexCode === 'D') return 'D';
    return 'M';
  }
  if (isSignificant(workTreeCode)) {
    if (workTreeCode === '?') return '??';
    if (workTreeCode === '!') return '!!';
    if (workTreeCode === 'R') return 'R';
    if (workTreeCode === 'A') return 'A';
    if (workTreeCode === 'D') return 'D';
    return 'M';
  }
  return null;
};

export const toFileChange = (entry: {
  path: string;
  oldPath?: string;
  index: string;
  workTree: string;
}): FileChange | null => {
  const status = aggregateStatus(entry.index, entry.workTree);
  if (!status) return null;
  const isStaged = isSignificant(entry.index);
  const isUnstaged = isSignificant(entry.workTree);
  const result: FileChange = {
    path: entry.path,
    status,
    isStaged,
    isUnstaged
  };
  if (entry.oldPath !== undefined) {
    result.oldPath = entry.oldPath;
  }
  return result;
};

export const listFileChanges = async (
  repoPath: string
): Promise<FileChange[]> => {
  const status = (await gitStatus({ repoPath })) as {
    files: Array<{
      path: string;
      oldPath?: string;
      index: string;
      workTree: string;
    }>;
  };
  return status.files
    .map(toFileChange)
    .filter((entry): entry is FileChange => entry !== null);
};
