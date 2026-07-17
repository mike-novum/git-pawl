import type {
  BranchInfo,
  Commit,
  DiffHunk,
  DiffLine,
  DiffLineType,
  FileStatus,
  FileStatusCode,
  GitStatus
} from '../../../shared/types/git';

const isFileStatusCode = (value: string): value is FileStatusCode =>
  value === ' ' ||
  value === 'M' ||
  value === 'A' ||
  value === 'D' ||
  value === 'R' ||
  value === 'C' ||
  value === 'U' ||
  value === '?' ||
  value === '!';

const readUntilNull = (input: string, start: number): { value: string; next: number } => {
  const end = input.indexOf('\0', start);
  if (end < 0) {
    return { value: input.slice(start), next: input.length };
  }
  return { value: input.slice(start, end), next: end + 1 };
};

const parseUpstream = (value: string): { ahead: number; behind: number } => {
  let ahead = 0;
  let behind = 0;
  const tokens = value.split(/[,\s]+/).filter((t) => t.length > 0);
  for (let i = 0; i < tokens.length - 1; i++) {
    const key = tokens[i];
    const num = Number.parseInt(tokens[i + 1], 10);
    if (Number.isNaN(num)) {
      continue;
    }
    if (key === 'ahead') {
      ahead = num;
    } else if (key === 'behind') {
      behind = num;
    }
  }
  return { ahead, behind };
};

const parseBranchLine = (line: string): BranchInfo => {
  const rest = line.startsWith('## ') ? line.slice(3) : line;
  if (rest === 'HEAD (no branch)') {
    return { detached: true };
  }
  const upstreamIdx = rest.indexOf('...');
  if (upstreamIdx < 0) {
    return { detached: false, current: rest || undefined };
  }
  const current = rest.slice(0, upstreamIdx);
  const after = rest.slice(upstreamIdx + 3);
  const branch: BranchInfo = {
    detached: false,
    current: current || undefined
  };
  const spaceIdx = after.indexOf(' ');
  if (spaceIdx >= 0) {
    const ref = after.slice(0, spaceIdx);
    const tracking = after.slice(spaceIdx + 1).trim();
    if (tracking.startsWith('[') && tracking.endsWith(']')) {
      branch.upstream = {
        ref,
        ...parseUpstream(tracking.slice(1, -1))
      };
    }
  } else if (after.length > 0) {
    branch.upstream = { ref: after, ahead: 0, behind: 0 };
  }
  return branch;
};

const parseFileStatusFromEntry = (
  xy: string,
  body: string
): FileStatus | null => {
  if (!isFileStatusCode(xy[0]) || !isFileStatusCode(xy[1])) {
    return null;
  }
  if (xy[0] === 'R' || xy[0] === 'C') {
    const sepIdx = body.indexOf('\0');
    if (sepIdx < 0) {
      return { path: body, index: xy[0], workTree: xy[1] };
    }
    const oldPath = body.slice(0, sepIdx);
    const path = body.slice(sepIdx + 1);
    return { path, oldPath, index: xy[0], workTree: xy[1] };
  }
  return { path: body, index: xy[0], workTree: xy[1] };
};

export const parseStatusPorcelain = (stdout: string): GitStatus => {
  let branch: BranchInfo = { detached: false };
  const files: FileStatus[] = [];
  let cursor = 0;

  while (cursor < stdout.length) {
    const entry = readUntilNull(stdout, cursor);
    if (entry.value.length === 0) {
      cursor = entry.next;
      continue;
    }
    if (entry.value.startsWith('## ')) {
      branch = parseBranchLine(entry.value);
      cursor = entry.next;
      continue;
    }
    if (entry.value.startsWith('?? ')) {
      files.push({
        path: entry.value.slice(3),
        index: '?',
        workTree: '?'
      });
      cursor = entry.next;
      continue;
    }
    if (entry.value.startsWith('!! ')) {
      files.push({
        path: entry.value.slice(3),
        index: '?',
        workTree: '!'
      });
      cursor = entry.next;
      continue;
    }
    if (entry.value.length < 3) {
      cursor = entry.next;
      continue;
    }
    const xy = entry.value.slice(0, 2);
    const isRename = xy[0] === 'R' || xy[0] === 'C';
    const rest = entry.value.slice(3);

    if (isRename) {
      const next = readUntilNull(stdout, entry.next);
      const file = parseFileStatusFromEntry(xy, `${rest}\0${next.value}`);
      if (file) {
        files.push(file);
      }
      cursor = next.next;
      continue;
    }

    const file = parseFileStatusFromEntry(xy, rest);
    if (file) {
      files.push(file);
    }
    cursor = entry.next;
  }

  return {
    branch,
    files,
    clean: files.length === 0
  };
};

const LOG_FIELD_SEPARATOR = '\x1f';
const LOG_RECORD_SEPARATOR = '\x1e';

export const parseLog = (stdout: string): Commit[] => {
  const trimmed = stdout.endsWith(LOG_RECORD_SEPARATOR)
    ? stdout.slice(0, -1)
    : stdout;
  if (trimmed.length === 0) {
    return [];
  }
  return trimmed
    .split(LOG_RECORD_SEPARATOR)
    .map((record) => {
      const [hash, parents, authorName, authorEmail, dateRaw, subject, body] =
        record.split(LOG_FIELD_SEPARATOR);
      if (!hash) {
        return null;
      }
      return {
        hash,
        parents: parents && parents.length > 0 ? parents.split(' ') : [],
        author: { name: authorName ?? '', email: authorEmail ?? '' },
        date: Number.parseInt(dateRaw ?? '0', 10) * 1000,
        subject: subject ?? '',
        body: body ?? ''
      } satisfies Commit;
    })
    .filter((commit): commit is Commit => commit !== null);
};

export const LOG_FORMAT = [
  '%H',
  '%P',
  '%an',
  '%ae',
  '%at',
  '%s',
  '%b'
].join(LOG_FIELD_SEPARATOR) + LOG_RECORD_SEPARATOR;

export const STATUS_PORCELAIN_FLAGS = ['--porcelain=v1', '-z', '--branch'];

const parseDiffLineType = (prefix: string): DiffLineType | null => {
  if (prefix === '+') {
    return 'add';
  }
  if (prefix === '-') {
    return 'del';
  }
  if (prefix === ' ') {
    return 'context';
  }
  return null;
};

export const parseDiff = (stdout: string): DiffHunk[] => {
  const lines = stdout.split('\n');
  const hunks: DiffHunk[] = [];
  let currentHunk: DiffHunk | null = null;
  let currentFilePath = '';
  let currentOldPath: string | undefined;

  const flushHunk = (): void => {
    if (currentHunk) {
      hunks.push(currentHunk);
      currentHunk = null;
    }
  };

  for (const line of lines) {
    if (line.startsWith('diff --git ')) {
      flushHunk();
      const match = /^diff --git a\/(.+) b\/(.+)$/.exec(line);
      if (match) {
        currentOldPath = match[1];
        currentFilePath = match[2];
      }
      continue;
    }
    if (line.startsWith('--- ')) {
      const path = line.slice(4);
      if (path === '/dev/null') {
        currentOldPath = undefined;
      } else if (path.startsWith('a/')) {
        currentOldPath = path.slice(2);
      }
      continue;
    }
    if (line.startsWith('+++ ')) {
      const path = line.slice(4);
      if (path === '/dev/null') {
        currentFilePath = currentOldPath ?? '';
      } else if (path.startsWith('b/')) {
        currentFilePath = path.slice(2);
      }
      continue;
    }
    if (line.startsWith('@@')) {
      flushHunk();
      const match = /^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@(.*)$/.exec(line);
      if (!match) {
        continue;
      }
      currentHunk = {
        filePath: currentFilePath,
        oldPath: currentOldPath,
        oldStart: Number.parseInt(match[1], 10),
        oldLines: Number.parseInt(match[2] ?? '1', 10),
        newStart: Number.parseInt(match[3], 10),
        newLines: Number.parseInt(match[4] ?? '1', 10),
        header: match[5]?.trim() ?? '',
        lines: []
      };
      continue;
    }
    if (currentHunk) {
      const prefix = line[0];
      const type = parseDiffLineType(prefix);
      if (type) {
        const content = line.slice(1);
        const diffLine: DiffLine = { type, content };
        if (type === 'add') {
          diffLine.newLine = currentHunk.newStart + countAdds(currentHunk.lines);
        } else if (type === 'del') {
          diffLine.oldLine = currentHunk.oldStart + countDels(currentHunk.lines);
        } else {
          diffLine.oldLine = currentHunk.oldStart + countDels(currentHunk.lines);
          diffLine.newLine = currentHunk.newStart + countAdds(currentHunk.lines);
        }
        currentHunk.lines.push(diffLine);
      } else if (line === '\\ No newline at end of file') {
        currentHunk.lines.push({ type: 'context', content: line });
      }
    }
  }

  flushHunk();
  return hunks;
};

const countAdds = (lines: DiffLine[]): number =>
  lines.reduce((acc, line) => acc + (line.type === 'add' ? 1 : 0), 0);

const countDels = (lines: DiffLine[]): number =>
  lines.reduce((acc, line) => acc + (line.type === 'del' ? 1 : 0), 0);

export const __testing = {
  parseUpstream,
  parseBranchLine,
  readUntilNull,
  isFileStatusCode
};
