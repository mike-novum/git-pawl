export type RepositoryTreeProps = {
  workspacePath: string | null;
  selectedRepoId?: string | null;
  onSelect?: (repoId: string) => void;
  className?: string;
};
