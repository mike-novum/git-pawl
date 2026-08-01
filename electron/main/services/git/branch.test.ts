import { describe, expect, it } from 'vitest';

import { parseBranchRefs, parseRevList } from './branch';

describe('parseBranchRefs', () => {
  it('returns branch names with their target hashes and empty commits', () => {
    const output = 'main\0abc123\nfeature/graph\0def456\n';

    expect(parseBranchRefs(output)).toEqual([
      { name: 'main', target: 'abc123', commits: [] },
      { name: 'feature/graph', target: 'def456', commits: [] }
    ]);
  });

  it('skips empty or malformed lines', () => {
    expect(parseBranchRefs('\n\n  \nmain\0abc')).toEqual([
      { name: 'main', target: 'abc', commits: [] }
    ]);
  });
});

describe('parseRevList', () => {
  it('returns newline-separated commit hashes', () => {
    const output = 'aaa111\nbbb222\nccc333\n';

    expect(parseRevList(output)).toEqual(['aaa111', 'bbb222', 'ccc333']);
  });

  it('filters out blank lines', () => {
    const output = 'aaa111\n\nbbb222\n   \nccc333\n';

    expect(parseRevList(output)).toEqual(['aaa111', 'bbb222', 'ccc333']);
  });

  it('returns an empty array for empty input', () => {
    expect(parseRevList('')).toEqual([]);
  });
});
