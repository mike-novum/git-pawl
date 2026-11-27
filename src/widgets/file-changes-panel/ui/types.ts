import type { FC } from 'react';

import type { FileChange } from '@/entities/file-change';

export type FileChangesPanelProps = {
  repoPath: string | null;
  selectedFile?: string | null;
  onSelectChange?: (path: string) => void;
  className?: string;
};

export type FC_FileChangesPanel = FC<FileChangesPanelProps>;

export type FileChangeListRowProps = {
  change: FileChange;
  isSelectedForDiff?: boolean;
  isStagedForCommit?: boolean;
  onSelect?: (path: string) => void;
  onToggleStage?: (path: string) => void;
};
