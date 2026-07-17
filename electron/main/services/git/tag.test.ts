import { describe, expect, it } from 'vitest';

import { gitTagSchema } from '../../../shared/schemas';

describe('gitTagSchema', () => {
  it('accepts list action without name', () => {
    const parsed = gitTagSchema.safeParse({
      repoPath: '/tmp/repo',
      action: 'list'
    });
    expect(parsed.success).toBe(true);
  });

  it('accepts create action with name and target', () => {
    const parsed = gitTagSchema.safeParse({
      repoPath: '/tmp/repo',
      action: 'create',
      name: 'v1.0.0',
      target: 'main',
      annotated: true,
      message: 'release 1.0.0'
    });
    expect(parsed.success).toBe(true);
  });

  it('accepts delete action with name', () => {
    const parsed = gitTagSchema.safeParse({
      repoPath: '/tmp/repo',
      action: 'delete',
      name: 'v1.0.0'
    });
    expect(parsed.success).toBe(true);
  });

  it('rejects invalid action', () => {
    const parsed = gitTagSchema.safeParse({
      repoPath: '/tmp/repo',
      action: 'merge'
    });
    expect(parsed.success).toBe(false);
  });

  it('requires repoPath', () => {
    const parsed = gitTagSchema.safeParse({
      action: 'list'
    });
    expect(parsed.success).toBe(false);
  });
});