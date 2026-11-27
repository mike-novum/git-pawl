import type { FC } from 'react';
import { GitPullRequestArrow } from 'lucide-react';

import { cn } from '@/shared/lib/theme';
import { Button, useToast } from '@/shared/ui';

import { useGitPull } from '../model';

import type { PullButtonProps } from './types';

export const PullButton: FC<PullButtonProps> = ({
  repoPath,
  branchName,
  variant = 'secondary',
  disabled = false,
  className,
  count
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
  const buttonVariant = variant === 'outline' ? 'secondary' : variant;

  return (
    <Button
      type="button"
      variant={buttonVariant}
      size="sm"
      onClick={handleClick}
      disabled={isDisabled}
      loading={isPending}
      leftIcon={<GitPullRequestArrow aria-hidden="true" className="size-3.5" />}
      className={className}
    >
      Pull
      {typeof count === 'number' && count > 0 ? (
        <span
          className={cn(
            'ml-1 rounded px-1.5 py-0.5 font-mono text-xs font-medium',
            buttonVariant === 'primary'
              ? 'bg-primary-foreground/20 text-primary-foreground'
              : 'bg-surface-elevated text-foreground'
          )}
        >
          ↓{count}
        </span>
      ) : null}
    </Button>
  );
};

PullButton.displayName = 'PullButton';
