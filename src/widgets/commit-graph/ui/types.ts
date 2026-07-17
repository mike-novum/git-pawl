export type CommitGraphProps = {
  repoPath: string | null;
  onCommitClick?: (hash: string) => void;
  className?: string;
};
