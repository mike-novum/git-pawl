import type { CommitMessage } from '../model';

export type CommitButtonProps = {
  repoPath: string;
  message: CommitMessage;
  bypassHooks?: boolean;
  disabled?: boolean;
  className?: string;
};
