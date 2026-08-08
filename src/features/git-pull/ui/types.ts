export type PullButtonVariant = 'primary' | 'secondary';

export type PullButtonProps = {
  repoPath: string;
  branchName?: string;
  variant?: PullButtonVariant;
  disabled?: boolean;
  className?: string;
};
