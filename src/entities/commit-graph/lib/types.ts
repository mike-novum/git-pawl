import type { Commit } from '@electron/shared/types/git';

export type CommitNode = {
  commit: Commit;
  parents: string[];
  children: string[];
};

export type CommitGraph = {
  nodes: Map<string, CommitNode>;
  roots: string[];
};
