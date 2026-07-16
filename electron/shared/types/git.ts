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