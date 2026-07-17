import type { Commit } from '@electron/shared/types/git';

import type { CommitGraph } from '../lib';

export const topologicalCommits = (graph: CommitGraph): Commit[] => {
  const visited = new Set<string>();
  const result: Commit[] = [];

  const visit = (hash: string): void => {
    if (visited.has(hash)) return;
    visited.add(hash);
    const node = graph.nodes.get(hash);
    if (!node) return;
    for (const parent of node.parents) {
      if (graph.nodes.has(parent)) {
        visit(parent);
      }
    }
    result.push(node.commit);
  };

  for (const rootHash of graph.roots) {
    visit(rootHash);
  }

  for (const hash of graph.nodes.keys()) {
    if (!visited.has(hash)) {
      visit(hash);
    }
  }

  return result;
};
