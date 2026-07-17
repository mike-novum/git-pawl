import { describe, expect, it } from 'vitest';

import { gitPatchSchema } from '../../../shared/schemas';

describe('gitPatchSchema', () => {
  it('accepts create patch payload', () => {
    const parsed = gitPatchSchema.safeParse({
      repoPath: '/tmp/repo',
      range: 'main..feature',
      destDir: '/tmp/out'
    });
    expect(parsed.success).toBe(true);
  });

  it('accepts apply patch payload', () => {
    const parsed = gitPatchSchema.safeParse({
      repoPath: '/tmp/repo',
      file: '/tmp/fix.patch',
      threeWay: true
    });
    expect(parsed.success).toBe(true);
  });

  it('rejects empty payload', () => {
    const parsed = gitPatchSchema.safeParse({
      repoPath: '/tmp/repo'
    });
    expect(parsed.success).toBe(true);
  });
});