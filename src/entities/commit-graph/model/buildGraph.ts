import type { Commit } from '@electron/shared/types/git';

import type { CommitGraph, CommitNode } from '../lib';

export const buildGraph = (commits: Commit[]): CommitGraph => {
  const nodes = new Map<string, CommitNode>();
  const roots: string[] = [];

  for (const commit of commits) {
    nodes.set(commit.hash, {
      commit,
      parents: [...commit.parents],
      children: []
    });
  }

  for (const node of nodes.values()) {
    for (const parentHash of node.parents) {
      const parentNode = nodes.get(parentHash);
      if (parentNode) {
        parentNode.children.push(node.commit.hash);
      }
    }
    if (node.parents.length === 0) {
      roots.push(node.commit.hash);
    }
  }

  return { nodes, roots };
};
