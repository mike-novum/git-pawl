export type CommitMessage =
  | string
  | {
      header: string;
      body?: string;
      footer?: string;
    };

export type CommitResult = {
  hash: string;
  stdout: string;
  stderr: string;
};

export type BranchListResult = string[];

export type GitTagListResult = Array<{
  name: string;
  type: 'annotated' | 'lightweight';
  target: string;
}>;

export type GitPatchResult = { files: string[] };

export type GitConfigResult = string | Record<string, string>;

export type GitHooksResult = Record<string, boolean>;