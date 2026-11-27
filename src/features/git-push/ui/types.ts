export type PushButtonVariant = 'primary' | 'secondary' | 'outline';

export type PushButtonProps = {
  repoPath: string;
  branchName?: string;
  variant?: PushButtonVariant;
  disabled?: boolean;
  className?: string;
  count?: number;
};
