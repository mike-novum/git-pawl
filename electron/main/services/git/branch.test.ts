import { describe, expect, it } from 'vitest';

import { parseBranchRefs } from './branch';

describe('parseBranchRefs', () => {
  it('returns branch names with their target hashes', () => {
    const output = 'main\0abc123\nfeature/graph\0def456\n';

    expect(parseBranchRefs(output)).toEqual([
      { name: 'main', target: 'abc123' },
      { name: 'feature/graph', target: 'def456' }
    ]);
  });
});
