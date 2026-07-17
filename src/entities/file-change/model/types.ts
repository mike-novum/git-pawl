export type { FileStatus, FileStatusCode } from '@electron/shared/types/git';

export type FileChange = {
  path: string;
  oldPath?: string;
  status: 'M' | 'A' | 'D' | '??' | 'R' | '!!';
  isStaged: boolean;
  isUnstaged: boolean;
};

export const FILE_CHANGE_STATUS_LABELS: Record<FileChange['status'], string> = {
  M: 'Modified',
  A: 'Added',
  D: 'Deleted',
  '??': 'Untracked',
  R: 'Renamed',
  '!!': 'Ignored'
};
