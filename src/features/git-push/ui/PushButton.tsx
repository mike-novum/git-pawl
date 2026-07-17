import type { FC } from 'react';
import { GitBranch, Upload } from 'lucide-react';

import { Button, useToast } from '@/shared/ui';

import { useGitPush } from '../model';

import type { PushButtonProps } from './types';

export const PushButton: FC<PushButtonProps> = ({
  repoPath,
  branchName,
  disabled = false,
  className
}) => {
  const toast = useToast();
  const { mutate, isPending } = useGitPush();

  const handleClick = (): void => {
    if (!repoPath || isPending) return;
    mutate(
      { repoPath },
      {
        onSuccess: () => {
          toast.success({
            title: 'Push complete',
            description: 'Local commits have been pushed'
          });
        },
        onError: (err) => {
          toast.error({
            title: 'Push failed',
            description: err.message
          });
        }
      }
    );
  };

  const isDisabled = disabled || isPending || !repoPath;
  const label = branchName ?? 'current';

  return (
    <Button
      type="button"
      variant="secondary"
      onClick={handleClick}
      disabled={isDisabled}
      loading={isPending}
      leftIcon={<GitBranch aria-hidden="true" className="size-4" />}
      className={className}
    >
      {label}
      <Upload aria-hidden="true" className="size-4" />
    </Button>
  );
};

PushButton.displayName = 'PushButton';