import { describe, expect, it } from 'vitest';

import { parseBranchList, parseCommitHash } from '@electron/main/services/git/runner';

describe('parseBranchList', () => {
  it('parses a multi-line branch list', () => {
    const raw = 'main\nfeature/login\nbugfix/header\n';
    expect(parseBranchList(raw)).toEqual(['main', 'feature/login', 'bugfix/header']);
  });

  it('drops empty lines and trims whitespace', () => {
    const raw = '\n  main  \n\n   feature/foo\n';
    expect(parseBranchList(raw)).toEqual(['main', 'feature/foo']);
  });

  it('returns an empty array for empty input', () => {
    expect(parseBranchList('')).toEqual([]);
    expect(parseBranchList('\n\n')).toEqual([]);
  });

  it('keeps branch names with slashes', () => {
    const raw = 'release/2025.07.0\nhotfix/critical\nmain\n';
    expect(parseBranchList(raw)).toEqual([
      'release/2025.07.0',
      'hotfix/critical',
      'main'
    ]);
  });
});

describe('parseCommitHash', () => {
  it('returns the first non-empty trimmed line', () => {
    expect(parseCommitHash('abc1234\n')).toBe('abc1234');
  });

  it('strips surrounding whitespace', () => {
    expect(parseCommitHash('  deadbeef  \n')).toBe('deadbeef');
  });

  it('returns empty string for empty input', () => {
    expect(parseCommitHash('')).toBe('');
  });

  it('returns first line only', () => {
    expect(parseCommitHash('first\nsecond')).toBe('first');
  });
});