export type PushButtonVariant = 'primary' | 'secondary';

export type PushButtonProps = {
  repoPath: string;
  branchName?: string;
  variant?: PushButtonVariant;
  disabled?: boolean;
  className?: string;
};
