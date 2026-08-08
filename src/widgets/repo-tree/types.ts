export type RepoTreeProps = {
  repoPath: string;
  selectedCommit: string | null;
  onSelectCommit: (hash: string) => void;
  onSwitchBranch?: (branchName: string) => void;
  className?: string;
};
