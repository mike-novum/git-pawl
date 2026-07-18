import type { CommitNode } from '@/widgets/repo-graph-vertical';

export type RepoDetailPanelProps = {
  commit: CommitNode | null;
  onCopyHash: (hash: string) => void;
  onCreatePatch: (hash: string) => void;
  onRevert: (hash: string) => void;
  onCherryPick: (hash: string) => void;
  onResetToHere: (hash: string) => void;
  uncommittedCount: number;
  onCommit: () => void;
  onStash: () => void;
  onDiscard: () => void;
  className?: string;
};
