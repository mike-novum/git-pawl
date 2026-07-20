export type CommitNode = {
  hash: string;
  shortHash: string;
  subject: string;
  author: string;
  timestamp: number;
  parents: string[];
  lane: number;
  branches?: string[];
  tags?: string[];
  isCurrentBranch?: boolean;
};

export type GraphParent = {
  hash: string;
  lane: number;
  rowIndex: number;
  active: boolean;
};

export type GraphRow = {
  commit: CommitNode;
  lane: number;
  active: boolean;
  parents: GraphParent[];
};

export type GraphLayout = {
  rows: GraphRow[];
  maxLane: number;
  width: number;
  height: number;
};

export type CommitRowProps = {
  row: GraphRow;
  rowIndex: number;
  graphWidth: number;
  selectedHash: string | null;
  onSelect: (hash: string) => void;
};

export type RepoGraphProps = {
  commits: CommitNode[];
  layout?: GraphLayout;
  selectedHash: string | null;
  onSelect: (hash: string) => void;
  isLoading?: boolean;
  isError?: boolean;
  className?: string;
};
