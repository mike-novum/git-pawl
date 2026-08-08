import type { FC } from 'react';
import { GitPullRequestArrow } from 'lucide-react';

import { Button, useToast } from '@/shared/ui';

import { useGitPush } from '../model';

import type { PushButtonProps } from './types';

export const PushButton: FC<PushButtonProps> = ({
  repoPath,
  branchName,
  variant = 'secondary',
  disabled = false,
  className
}) => {
  const toast = useToast();
  const { mutate, isPending } = useGitPush();
  const label = branchName ?? 'current';

  const handleClick = (): void => {
    if (!repoPath || isPending) return;
    mutate(
      { repoPath },
      {
        onSuccess: () => {
          toast.success({
            title: `Пуш ветки ${label} выполнен`
          });
        },
        onError: (err) => {
          toast.error({
            title: `Не удалось выполнить push ветки ${label}`,
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
      leftIcon={
        <GitPullRequestArrow
          aria-hidden="true"
          className="size-3.5 -scale-y-100"
        />
      }
      className={className}
    >
      Push
    </Button>
  );
};

PushButton.displayName = 'PushButton';
