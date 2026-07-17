import type { CommitMessage } from '@/widgets/commit-message-form';
import type { TerminalLine } from '@/widgets/terminal-output';

export type RepositoryPageProps = Record<string, never>;

export type RepositoryTabId = 'branches' | 'tags' | 'stash';

export type RepoHeaderProps = {
  name: string;
  path: string;
  branch: string | null;
  isDetached: boolean;
  repoPath: string | null;
  className?: string;
};

export type BranchTabsSectionProps = {
  repoPath: string | null;
  className?: string;
};

export type CommitPanelProps = {
  repoPath: string | null;
  onCommit: (message: CommitMessage) => void;
  isCommitting: boolean;
  onTerminalLines: (lines: TerminalLine[]) => void;
  className?: string;
};
