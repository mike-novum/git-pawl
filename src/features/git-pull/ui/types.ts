export type PullButtonVariant = 'primary' | 'secondary' | 'outline';

export type PullButtonProps = {
  repoPath: string;
  branchName?: string;
  variant?: PullButtonVariant;
  disabled?: boolean;
  className?: string;
  count?: number;
};
