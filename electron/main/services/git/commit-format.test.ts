import { describe, expect, it } from 'vitest';

import { formatCommitMessage, needsMessageFile } from './commit-format';

describe('formatCommitMessage', () => {
  it('returns a plain string unchanged', () => {
    expect(formatCommitMessage('hello world')).toBe('hello world');
  });

  it('joins structured parts with a blank line', () => {
    expect(formatCommitMessage({ header: 'h', body: 'b', footer: 'f' })).toBe(
      'h\n\nb\n\nf'
    );
  });

  it('omits the body when it is missing', () => {
    expect(formatCommitMessage({ header: 'h', footer: 'f' })).toBe('h\n\nf');
  });

  it('omits the footer when it is missing', () => {
    expect(formatCommitMessage({ header: 'h', body: 'b' })).toBe('h\n\nb');
  });

  it('returns just the header when body and footer are missing', () => {
    expect(formatCommitMessage({ header: 'h' })).toBe('h');
  });

  it('preserves internal newlines inside the body', () => {
    const result = formatCommitMessage({
      header: 'feat: x',
      body: 'line 1\nline 2\nline 3'
    });
    expect(result).toBe('feat: x\n\nline 1\nline 2\nline 3');
  });

  it('treats an empty string as a plain message', () => {
    expect(formatCommitMessage('')).toBe('');
  });
});

describe('needsMessageFile', () => {
  it('returns false for a single-line string', () => {
    expect(needsMessageFile('hello')).toBe(false);
  });

  it('returns true for a string containing a newline', () => {
    expect(needsMessageFile('a\nb')).toBe(true);
  });

  it('returns true for a structured header-only message joined with body', () => {
    expect(needsMessageFile('h\n\nb')).toBe(true);
  });
});