import { describe, expect, it } from 'vitest';

import { gitHooksSchema } from '../../../shared/schemas';

describe('gitHooksSchema', () => {
  it('accepts payload with repoPath', () => {
    const parsed = gitHooksSchema.safeParse({
      repoPath: '/tmp/repo'
    });
    expect(parsed.success).toBe(true);
  });

  it('accepts payload with list=true', () => {
    const parsed = gitHooksSchema.safeParse({
      repoPath: '/tmp/repo',
      list: true
    });
    expect(parsed.success).toBe(true);
  });

  it('requires repoPath', () => {
    const parsed = gitHooksSchema.safeParse({
      list: true
    });
    expect(parsed.success).toBe(false);
  });
});