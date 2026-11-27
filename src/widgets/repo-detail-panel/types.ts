import type { FileChange } from '@/entities/file-change';
import type { CommitNode } from '@/widgets/repo-graph-vertical';

export type RepoDetailPanelProps = {
  commit: CommitNode | null;
  repoPath?: string | null;
  onCopyHash: (hash: string) => void;
  onCreatePatch: (hash: string) => void;
  onCherryPick: (hash: string) => void;
  onRevert: (hash: string) => void;
  onResetToHere: (hash: string) => void;
  onCommit: (message: string) => void;
  className?: string;
};

export type UncommittedViewProps = {
  repoPath: string | null;
  onCommit: (message: string) => void;
  className?: string;
};

export type CommitViewProps = {
  commit: CommitNode;
  repoPath: string | null;
  onCopyHash: (hash: string) => void;
  onCreatePatch: (hash: string) => void;
  onCherryPick: (hash: string) => void;
  onRevert: (hash: string) => void;
  onResetToHere: (hash: string) => void;
  className?: string;
};

export type CommitFilesListProps = {
  changes: FileChange[];
  selectedFile?: string | null;
  onSelectFile?: (path: string) => void;
};

export type CommitActionsMenuProps = {
  commitHash: string;
  onCopyHash: (hash: string) => void;
  onCreatePatch: (hash: string) => void;
  onCherryPick: (hash: string) => void;
  onRevert: (hash: string) => void;
  onResetToHere: (hash: string) => void;
};
