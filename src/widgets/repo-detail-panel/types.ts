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
