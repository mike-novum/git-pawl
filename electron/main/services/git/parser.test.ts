import { describe, expect, it } from 'vitest';

import { parseDiff, parseLog, parseStatusPorcelain } from './parser';

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
  it('returns empty array for empty input', () => {
    expect(parseLog('')).toEqual([]);
  });

  it('parses single commit', () => {
    const stdout = [
      'abc123',
      'parent1 parent2',
      'Alice',
      'alice@example.com',
      '1700000000',
      'Subject line',
      'Body line\nsecond line'
    ].join('\x1f') + '\x1e';

    const commits = parseLog(stdout);

    expect(commits).toHaveLength(1);
    expect(commits[0]).toEqual({
      hash: 'abc123',
      parents: ['parent1', 'parent2'],
      author: { name: 'Alice', email: 'alice@example.com' },
      date: 1700000000000,
      subject: 'Subject line',
      body: 'Body line\nsecond line'
    });
  });

  it('parses multiple commits', () => {
    const make = (hash: string, subject: string): string =>
      [hash, '', 'Bob', 'b@e.com', '1700000001', subject, ''].join('\x1f');

    const stdout = make('aaa', 'first') + '\x1e' + make('bbb', 'second') + '\x1e';

    const commits = parseLog(stdout);

    expect(commits.map((c) => c.hash)).toEqual(['aaa', 'bbb']);
    expect(commits.map((c) => c.subject)).toEqual(['first', 'second']);
    expect(commits[0].date).toBe(1700000001000);
  });

  it('parses commit with no parents (root commit)', () => {
    const stdout = ['root', '', 'X', 'x@e.com', '1700000002', 'init', ''].join(
      '\x1f'
    ) + '\x1e';

    const commits = parseLog(stdout);

    expect(commits[0].parents).toEqual([]);
  });

  it('handles missing trailing record separator', () => {
    const stdout = ['aaa', '', 'X', 'x@e.com', '1', 's', ''].join('\x1f');

    const commits = parseLog(stdout);

    expect(commits).toHaveLength(1);
    expect(commits[0].hash).toBe('aaa');
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
