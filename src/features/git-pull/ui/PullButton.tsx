import type { FC } from 'react';
import { GitPullRequestArrow } from 'lucide-react';

import { Button, useToast } from '@/shared/ui';

import { useGitPull } from '../model';

import type { PullButtonProps } from './types';

export const PullButton: FC<PullButtonProps> = ({
  repoPath,
  branchName,
  variant = 'secondary',
  disabled = false,
  className
}) => {
  const toast = useToast();
  const { mutate, isPending } = useGitPull();
  const label = branchName ?? 'current';

  const handleClick = (): void => {
    if (!repoPath || isPending) return;
    mutate(
      { repoPath },
      {
        onSuccess: () => {
          toast.success({
            title: `Пулл ветки ${label} выполнен`
          });
        },
        onError: (err) => {
          toast.error({
            title: `Не удалось выполнить pull ветки ${label}`,
            description: err.message
          });
        }
      }
    );
  };

  const isDisabled = disabled || isPending || !repoPath;

  return (
    <Button
      type="button"
      variant={variant}
      size="sm"
      onClick={handleClick}
      disabled={isDisabled}
      loading={isPending}
      leftIcon={<GitPullRequestArrow aria-hidden="true" className="size-3.5" />}
      className={className}
    >
      Pull
    </Button>
  );
};

PullButton.displayName = 'PullButton';
