import { describe, expect, it } from 'vitest';

import type { Commit } from '@electron/shared/types/git';

import type { CommitGraph } from '../lib';

import { buildGraph } from './buildGraph';
import { topologicalCommits } from './topologicalCommits';

const makeCommit = (hash: string, parents: string[] = []): Commit => ({
  hash,
  parents,
  author: { name: 'Test', email: 'test@example.com' },
  date: 0,
  subject: '',
  body: ''
});

const hashOf = (commits: Commit[]): string[] => commits.map((c) => c.hash);

describe('topologicalCommits', () => {
  it('orders linear history with parents first', () => {
    const graph = buildGraph([
      makeCommit('c', ['b']),
      makeCommit('b', ['a']),
      makeCommit('a')
    ]);
    const ordered = topologicalCommits(graph);
    expect(hashOf(ordered)).toEqual(['a', 'b', 'c']);
  });

  it('orders merge commit after both parents', () => {
    const graph = buildGraph([
      makeCommit('m', ['b', 'c']),
      makeCommit('b', ['a']),
      makeCommit('c', ['a']),
      makeCommit('a')
    ]);
    const ordered = topologicalCommits(graph);
    const hashes = hashOf(ordered);
    expect(hashes.indexOf('a')).toBeLessThan(hashes.indexOf('b'));
    expect(hashes.indexOf('a')).toBeLessThan(hashes.indexOf('c'));
    expect(hashes.indexOf('b')).toBeLessThan(hashes.indexOf('m'));
    expect(hashes.indexOf('c')).toBeLessThan(hashes.indexOf('m'));
  });

  it('returns empty array for empty graph', () => {
    const empty: CommitGraph = { nodes: new Map(), roots: [] };
    expect(topologicalCommits(empty)).toEqual([]);
  });

  it('includes orphan nodes not reachable from roots', () => {
    const graph = buildGraph([makeCommit('orphan', ['unknown'])]);
    const ordered = topologicalCommits(graph);
    expect(hashOf(ordered)).toEqual(['orphan']);
  });
});
