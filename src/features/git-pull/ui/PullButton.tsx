import type { FC } from 'react';
import { Download, GitBranch } from 'lucide-react';

import { Button, useToast } from '@/shared/ui';

import { useGitPull } from '../model';

import type { PullButtonProps } from './types';

export const PullButton: FC<PullButtonProps> = ({
  repoPath,
  branchName,
  disabled = false,
  className
}) => {
  const toast = useToast();
  const { mutate, isPending } = useGitPull();

  const handleClick = (): void => {
    if (!repoPath || isPending) return;
    mutate(
      { repoPath },
      {
        onSuccess: () => {
          toast.success({
            title: 'Pull complete',
            description: 'Repository is up to date'
          });
        },
        onError: (err) => {
          toast.error({
            title: 'Pull failed',
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
      <Download aria-hidden="true" className="size-4" />
    </Button>
  );
};

PullButton.displayName = 'PullButton';
