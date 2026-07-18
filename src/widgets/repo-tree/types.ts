export type RepoTreeProps = {
  repoPath: string;
  selectedCommit: string | null;
  onSelectCommit: (hash: string) => void;
  className?: string;
};
