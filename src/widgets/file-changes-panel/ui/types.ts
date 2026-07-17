import type { FC } from 'react';

import type { FileChange } from '@/entities/file-change';

export type FileChangesPanelProps = {
  repoPath: string | null;
  onSelectChange?: (path: string) => void;
  className?: string;
};

export type FC_FileChangesPanel = FC<FileChangesPanelProps>;

export type FileChangeListRowProps = {
  change: FileChange;
  onSelect?: (path: string) => void;
};