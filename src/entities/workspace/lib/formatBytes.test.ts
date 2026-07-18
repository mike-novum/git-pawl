import { describe, expect, it } from 'vitest';

import { formatBytes } from './formatBytes';

describe('formatBytes', () => {
  it('returns 0 B for zero', () => {
    expect(formatBytes(0)).toBe('0 B');
  });

  it('formats bytes under 1024 as B', () => {
    expect(formatBytes(512)).toBe('512 B');
  });

  it('formats KB with no decimals under 10', () => {
    expect(formatBytes(38 * 1024)).toBe('38 KB');
  });

  it('formats MB with one decimal when >= 10', () => {
    expect(formatBytes(124 * 1024 * 1024)).toBe('124 MB');
  });

  it('formats GB with one decimal', () => {
    expect(formatBytes(2.1 * 1024 * 1024 * 1024)).toBe('2.1 GB');
  });
});