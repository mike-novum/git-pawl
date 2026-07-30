import type { ReactNode } from 'react';

export type CommitNode = {
  hash: string;
  shortHash: string;
  subject: string;
  author: string;
  authorEmail?: string;
  timestamp: number;
  parents: string[];
  lane: number;
  color?: string;
  branches?: string[];
  tags?: string[];
  currentBranchName?: string;
  isCurrentBranch?: boolean;
};

export type GraphParent = {
  hash: string;
  lane: number;
  rowIndex: number;
  active: boolean;
  color: string;
};

export type GraphLine = {
  fromLane: number;
  toLane: number;
  fromY: number;
  toY: number;
  color: string;
};

export type GraphLane = {
  index: number;
  branchName: string;
  color: string;
};

export type GraphRow = {
  commit: CommitNode;
  lane: number;
  active: boolean;
  parents: GraphParent[];
};

export type GraphLayout = {
  rows: GraphRow[];
  lanes: GraphLane[];
  maxLane: number;
  continuousLines: GraphLine[];
  parentEdges: GraphLine[];
  width: number;
  height: number;
};

export type CommitRowProps = {
  row: GraphRow;
  rowIndex: number;
  graphWidth: number;
  selectedHash: string | null;
  onSelect: (hash: string) => void;
  graphOverlay?: ReactNode;
};

export type ColumnKey = 'graph' | 'description' | 'commit' | 'author' | 'date';

export type ColumnWidths = Record<ColumnKey, number | null>;

export type RepoGraphTableProps = {
  layout: GraphLayout;
  selectedHash: string | null;
  onSelect: (hash: string) => void;
  className?: string;
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

export type GraphLayerProps = {
  layout: GraphLayout;
  selectedHash: string | null;
};
