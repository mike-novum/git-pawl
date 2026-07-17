import { describe, expect, it } from 'vitest';

import type { Commit } from '@electron/shared/types/git';

import { buildGraph } from './buildGraph';

const makeCommit = (hash: string, parents: string[] = [], subject = ''): Commit => ({
  hash,
  parents,
  author: { name: 'Test', email: 'test@example.com' },
  date: 0,
  subject,
  body: ''
});

describe('buildGraph', () => {
  it('returns empty graph for empty input', () => {
    const graph = buildGraph([]);
    expect(graph.nodes.size).toBe(0);
    expect(graph.roots).toEqual([]);
  });

  it('marks commits without parents as roots', () => {
    const a = makeCommit('a');
    const b = makeCommit('b');
    const graph = buildGraph([a, b]);

    expect(graph.roots).toEqual(['a', 'b']);
    expect(graph.nodes.get('a')?.parents).toEqual([]);
    expect(graph.nodes.get('b')?.parents).toEqual([]);
  });

  it('builds children edges for linear history', () => {
    const a = makeCommit('a');
    const b = makeCommit('b', ['a']);
    const c = makeCommit('c', ['b']);
    const graph = buildGraph([a, b, c]);

    expect(graph.roots).toEqual(['a']);
    expect(graph.nodes.get('a')?.children).toEqual(['b']);
    expect(graph.nodes.get('b')?.children).toEqual(['c']);
    expect(graph.nodes.get('c')?.children).toEqual([]);
  });

  it('handles merge commits with two parents', () => {
    const a = makeCommit('a');
    const b = makeCommit('b', ['a']);
    const c = makeCommit('c', ['a']);
    const merge = makeCommit('m', ['b', 'c']);
    const graph = buildGraph([a, b, c, merge]);

    expect(graph.roots).toEqual(['a']);
    const mergeNode = graph.nodes.get('m');
    expect(mergeNode?.parents).toEqual(['b', 'c']);
    expect(graph.nodes.get('b')?.children).toEqual(['m']);
    expect(graph.nodes.get('c')?.children).toEqual(['m']);
    expect(mergeNode?.children).toEqual([]);
  });

  it('does not register child edge for unknown parent', () => {
    const orphan = makeCommit('x', ['missing']);
    const graph = buildGraph([orphan]);

    expect(graph.nodes.get('x')?.parents).toEqual(['missing']);
    expect(graph.nodes.get('x')?.children).toEqual([]);
  });

  it('preserves commit data inside nodes', () => {
    const a = makeCommit('a', [], 'first commit');
    const graph = buildGraph([a]);

    expect(graph.nodes.get('a')?.commit.subject).toBe('first commit');
    expect(graph.nodes.get('a')?.commit.hash).toBe('a');
  });
});
