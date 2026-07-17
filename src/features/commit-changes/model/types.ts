export type CommitMessage = {
  header: string;
  body?: string;
  footer?: string;
};

export type CommitInput = {
  message: CommitMessage;
  bypassHooks?: boolean;
};

export type CommitResult = {
  hash: string;
  stdout: string;
  stderr: string;
};
