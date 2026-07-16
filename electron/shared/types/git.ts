export type FileStatusCode =
  | 'M'
  | 'A'
  | 'D'
  | 'R'
  | 'C'
  | 'U'
  | '?'
  | '!';

export type FileStatus = {
  path: string;
  oldPath?: string;
  index: FileStatusCode;
  workTree: FileStatusCode;
};

export type BranchInfo = {
  current?: string;
  upstream?: { ref: string; ahead: number; behind: number };
  detached: boolean;
};

export type GitStatus = {
  branch: BranchInfo;
  files: FileStatus[];
  clean: boolean;
};

export type CommitAuthor = {
  name: string;
  email: string;
};

export type Commit = {
  hash: string;
  parents: string[];
  author: CommitAuthor;
  date: number;
  subject: string;
  body: string;
};

export type DiffLineType = 'add' | 'del' | 'context';

export type DiffLine = {
  type: DiffLineType;
  content: string;
  oldLine?: number;
  newLine?: number;
};

export type DiffHunk = {
  filePath: string;
  oldPath?: string;
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  header: string;
  lines: DiffLine[];
};

export class GitError extends Error {
  args: string[];
  exitCode: number;
  stdout: string;
  stderr: string;
  cwd: string;

  constructor(params: {
    message: string;
    args: string[];
    exitCode: number;
    stdout: string;
    stderr: string;
    cwd: string;
  }) {
    super(params.message);
    this.name = 'GitError';
    this.args = params.args;
    this.exitCode = params.exitCode;
    this.stdout = params.stdout;
    this.stderr = params.stderr;
    this.cwd = params.cwd;
  }
}
