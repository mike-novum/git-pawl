import { describe, expect, it } from 'vitest';

import { gitConfigSchema } from '../../../shared/schemas';

describe('gitConfigSchema', () => {
  it('accepts get all (no key)', () => {
    const parsed = gitConfigSchema.safeParse({
      repoPath: '/tmp/repo'
    });
    expect(parsed.success).toBe(true);
  });

  it('accepts get with scope and key', () => {
    const parsed = gitConfigSchema.safeParse({
      repoPath: '/tmp/repo',
      scope: 'global',
      key: 'user.name'
    });
    expect(parsed.success).toBe(true);
  });

  it('accepts set with value', () => {
    const parsed = gitConfigSchema.safeParse({
      repoPath: '/tmp/repo',
      key: 'user.name',
      value: 'Alice'
    });
    expect(parsed.success).toBe(true);
  });

  it('accepts unset with unset=true', () => {
    const parsed = gitConfigSchema.safeParse({
      repoPath: '/tmp/repo',
      key: 'user.name',
      unset: true
    });
    expect(parsed.success).toBe(true);
  });

  it('rejects invalid scope', () => {
    const parsed = gitConfigSchema.safeParse({
      repoPath: '/tmp/repo',
      scope: 'everywhere'
    });
    expect(parsed.success).toBe(false);
  });

  it('rejects empty key when required', () => {
    const parsed = gitConfigSchema.safeParse({
      repoPath: '/tmp/repo',
      key: ''
    });
    expect(parsed.success).toBe(false);
  });
});