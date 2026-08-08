import { describe, expect, it } from 'vitest';

import { parseDiff, parseLog, parseShowNameStatus, parseStatusPorcelain } from './parser';

describe('parseStatusPorcelain', () => {
  it('parses empty output as clean status', () => {
    const status = parseStatusPorcelain('');

    expect(status.clean).toBe(true);
    expect(status.files).toEqual([]);
  });

  it('parses branch line with upstream tracking', () => {
    const stdout = '## main...origin/main [ahead 3, behind 1]\0M  src/index.ts\0';

    const status = parseStatusPorcelain(stdout);

    expect(status.branch.current).toBe('main');
    expect(status.branch.upstream).toEqual({
      ref: 'origin/main',
      ahead: 3,
      behind: 1
    });
    expect(status.clean).toBe(false);
    expect(status.files).toHaveLength(1);
    expect(status.files[0]).toEqual({
      path: 'src/index.ts',
      index: 'M',
      workTree: ' '
    });
  });

  it('parses detached HEAD branch line', () => {
    const stdout = '## HEAD (no branch)\0';

    const status = parseStatusPorcelain(stdout);

    expect(status.branch.detached).toBe(true);
    expect(status.branch.current).toBeUndefined();
  });

  it('parses local branch without upstream', () => {
    const stdout = '## feature\0';

    const status = parseStatusPorcelain(stdout);

    expect(status.branch.current).toBe('feature');
    expect(status.branch.upstream).toBeUndefined();
    expect(status.branch.detached).toBe(false);
  });

  it('parses untracked files', () => {
    const stdout = '## main\0?? new-file.txt\0';

    const status = parseStatusPorcelain(stdout);

    expect(status.files).toHaveLength(1);
    expect(status.files[0]).toEqual({
      path: 'new-file.txt',
      index: '?',
      workTree: '?'
    });
  });

  it('parses ignored files', () => {
    const stdout = '## main\0!! ignored.txt\0';

    const status = parseStatusPorcelain(stdout);

    expect(status.files).toHaveLength(1);
    expect(status.files[0]).toEqual({
      path: 'ignored.txt',
      index: '?',
      workTree: '!'
    });
  });

  it('parses renames with old and new paths', () => {
    const stdout = '## main\0R  old-name\0new-name\0';

    const status = parseStatusPorcelain(stdout);

    expect(status.files).toHaveLength(1);
    expect(status.files[0]).toEqual({
      path: 'new-name',
      oldPath: 'old-name',
      index: 'R',
      workTree: ' '
    });
  });

  it('parses staged and unstaged changes', () => {
    const stdout =
      '## main\0M  staged.txt\0 M unstaged.txt\0MM both.txt\0A  added.txt\0D  deleted.txt\0';

    const status = parseStatusPorcelain(stdout);

    expect(status.files).toHaveLength(5);
    const byPath = Object.fromEntries(status.files.map((f) => [f.path, f]));
    expect(byPath['staged.txt']).toEqual({
      path: 'staged.txt',
      index: 'M',
      workTree: ' '
    });
    expect(byPath['unstaged.txt']).toEqual({
      path: 'unstaged.txt',
      index: ' ',
      workTree: 'M'
    });
    expect(byPath['both.txt']).toEqual({
      path: 'both.txt',
      index: 'M',
      workTree: 'M'
    });
    expect(byPath['added.txt'].index).toBe('A');
    expect(byPath['deleted.txt'].index).toBe('D');
  });

  it('handles missing trailing null byte', () => {
    const stdout = '## main\0M  a.txt';

    const status = parseStatusPorcelain(stdout);

    expect(status.files).toHaveLength(1);
    expect(status.files[0].path).toBe('a.txt');
  });
});

describe('parseLog', () => {
  const record = (fields: string[]): string => {
    const separator = '\x1f';
    return fields.join(separator) + '\x1e';
  };

  it('returns empty array for empty input', () => {
    expect(parseLog('')).toEqual([]);
  });

  it('parses a linear history', () => {
    const stdout = [
      record(['third', 'second', 'Alice', 'alice@example.com', '1700000002', 'third', '']),
      record(['second', 'first', 'Alice', 'alice@example.com', '1700000001', 'second', '']),
      record(['first', '', 'Alice', 'alice@example.com', '1700000000', 'first', ''])
    ].join('\n');

    const commits = parseLog(stdout);

    expect(commits.map(({ hash, parents }) => ({ hash, parents }))).toEqual([
      { hash: 'third', parents: ['second'] },
      { hash: 'second', parents: ['first'] },
      { hash: 'first', parents: [] }
    ]);
  });

  it('parses a merge commit with two parents', () => {
    const stdout = record([
      'merge',
      'main feature',
      'Alice',
      'alice@example.com',
      '1700000000',
      'merge subject',
      ''
    ]);

    const commits = parseLog(stdout);

    expect(commits[0]?.parents).toEqual(['main', 'feature']);
  });

  it('parses a commit with an empty subject', () => {
    const stdout = record(['root', '', 'Alice', 'alice@example.com', '1', '', '']);

    const commits = parseLog(stdout);

    expect(commits).toHaveLength(1);
    expect(commits[0]?.subject).toBe('');
  });

  it('parses a commit with a multi-line body', () => {
    const stdout = record([
      'abc123',
      '',
      'Alice',
      'alice@example.com',
      '1700000000',
      'Subject line',
      'Body line\nsecond line'
    ]);

    const commits = parseLog(stdout);

    expect(commits[0]?.body).toBe('Body line\nsecond line');
  });

  it('preserves subject containing the record sentinel', () => {
    const stdout = record([
      'abc123',
      '',
      'Alice',
      'alice@example.com',
      '1700000000',
      'before --RECORD-- after',
      ''
    ]);

    const commits = parseLog(stdout);

    expect(commits[0]?.subject).toBe('before --RECORD-- after');
  });

  it('preserves body containing the record sentinel', () => {
    const stdout = record([
      'abc123',
      '',
      'Alice',
      'alice@example.com',
      '1700000000',
      'subject',
      'before --RECORD-- after'
    ]);

    const commits = parseLog(stdout);

    expect(commits[0]?.body).toBe('before --RECORD-- after');
  });

  it('does not crash when body contains ascii printable characters', () => {
    const stdout = record([
      'abc123',
      '',
      'Alice',
      'alice@example.com',
      '1700000000',
      'subject',
      'body with --RECORD-- sentinel and (parentheses) and {braces}'
    ]);

    const commits = parseLog(stdout);

    expect(commits[0]?.body).toBe(
      'body with --RECORD-- sentinel and (parentheses) and {braces}'
    );
  });

  it('preserves multi-line body across newlines', () => {
    const stdout = record([
      'abc123',
      '',
      'Alice',
      'alice@example.com',
      '1700000000',
      'subject',
      'line 1\nline 2\nline 3'
    ]);

    const commits = parseLog(stdout);

    expect(commits[0]?.body).toBe('line 1\nline 2\nline 3');
  });

  it('drops records with an empty hash or timestamp', () => {
    const stdout = [
      record(['', '', 'Alice', 'alice@example.com', '1700000000', '', '']),
      record(['abc123', '', 'Alice', 'alice@example.com', '', '', '']),
      record(['valid', '', 'Alice', 'alice@example.com', '1700000000', 'subject', ''])
    ].join('\n');

    const commits = parseLog(stdout);

    expect(commits.map(({ hash }) => hash)).toEqual(['valid']);
  });

  it('handles a missing trailing record separator', () => {
    const stdout = 'aaa\x1f\x1fX\x1fx@e.com\x1f1\x1fs';

    const commits = parseLog(stdout);

    expect(commits).toHaveLength(1);
    expect(commits[0]?.hash).toBe('aaa');
  });
});

describe('parseDiff', () => {
  it('returns empty array for empty input', () => {
    expect(parseDiff('')).toEqual([]);
  });

  it('parses simple hunk with add and del lines', () => {
    const stdout = [
      'diff --git a/file.txt b/file.txt',
      'index 1234..5678 100644',
      '--- a/file.txt',
      '+++ b/file.txt',
      '@@ -1,3 +1,4 @@',
      ' context',
      '-removed',
      '+added',
      ' unchanged'
    ].join('\n');

    const hunks = parseDiff(stdout);

    expect(hunks).toHaveLength(1);
    expect(hunks[0].filePath).toBe('file.txt');
    expect(hunks[0].oldStart).toBe(1);
    expect(hunks[0].oldLines).toBe(3);
    expect(hunks[0].newStart).toBe(1);
    expect(hunks[0].newLines).toBe(4);
    expect(hunks[0].lines).toHaveLength(4);

    const lines = hunks[0].lines;
    expect(lines[0]).toMatchObject({ type: 'context', content: 'context' });
    expect(lines[1]).toMatchObject({ type: 'del', content: 'removed' });
    expect(lines[2]).toMatchObject({ type: 'add', content: 'added' });
    expect(lines[3]).toMatchObject({ type: 'context', content: 'unchanged' });
  });

  it('parses multiple hunks across two files', () => {
    const stdout = [
      'diff --git a/a.txt b/a.txt',
      '--- a/a.txt',
      '+++ b/a.txt',
      '@@ -1 +1 @@',
      '-old',
      '+new',
      'diff --git a/b.txt b/b.txt',
      '--- a/b.txt',
      '+++ b/b.txt',
      '@@ -10,2 +10,2 @@',
      ' keep',
      '-x',
      '+y'
    ].join('\n');

    const hunks = parseDiff(stdout);

    expect(hunks).toHaveLength(2);
    expect(hunks[0].filePath).toBe('a.txt');
    expect(hunks[1].filePath).toBe('b.txt');
    expect(hunks[1].oldStart).toBe(10);
  });

  it('handles new file', () => {
    const stdout = [
      'diff --git a/new.txt b/new.txt',
      'new file mode 100644',
      'index 0000..1234',
      '--- /dev/null',
      '+++ b/new.txt',
      '@@ -0,0 +1,2 @@',
      '+line 1',
      '+line 2'
    ].join('\n');

    const hunks = parseDiff(stdout);

    expect(hunks).toHaveLength(1);
    expect(hunks[0].oldStart).toBe(0);
    expect(hunks[0].newStart).toBe(1);
    expect(hunks[0].oldPath).toBeUndefined();
    expect(hunks[0].filePath).toBe('new.txt');
    expect(hunks[0].lines.every((l) => l.type === 'add')).toBe(true);
  });
});

describe('parseShowNameStatus', () => {
  it('returns empty array for empty input', () => {
    expect(parseShowNameStatus('')).toEqual([]);
  });

  it('parses modified, added, and deleted files', () => {
    const stdout = ['M\tsrc/changed.ts', 'A\tsrc/added.ts', 'D\tsrc/gone.ts'].join('\n');

    const files = parseShowNameStatus(stdout);

    expect(files).toEqual([
      { path: 'src/changed.ts', index: 'M', workTree: 'M' },
      { path: 'src/added.ts', index: 'A', workTree: 'A' },
      { path: 'src/gone.ts', index: 'D', workTree: 'D' }
    ]);
  });

  it('parses renamed files with old path', () => {
    const stdout = 'R100\told/name.ts\tnew/name.ts';

    const files = parseShowNameStatus(stdout);

    expect(files).toEqual([
      {
        path: 'new/name.ts',
        oldPath: 'old/name.ts',
        index: 'R',
        workTree: 'R'
      }
    ]);
  });

  it('skips blank lines and unknown status codes', () => {
    const stdout = ['M\tsrc/a.ts', '', 'X\tsrc/b.ts', 'A\tsrc/c.ts'].join('\n');

    const files = parseShowNameStatus(stdout);

    expect(files).toHaveLength(2);
    expect(files[0]?.path).toBe('src/a.ts');
    expect(files[1]?.path).toBe('src/c.ts');
  });
});
