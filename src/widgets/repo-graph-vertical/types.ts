export type CommitNode = {
  hash: string;
  shortHash: string;
  subject: string;
  author: string;
  timestamp: number;
  parents: string[];
  lane: number;
};

export type RepoGraphProps = {
  commits: CommitNode[];
  selectedHash: string | null;
  onSelect: (hash: string) => void;
  className?: string;
};
