import type { FC } from 'react';
import { GitPullRequestArrow } from 'lucide-react';

import { cn } from '@/shared/lib/theme';
import { Button, useToast } from '@/shared/ui';

import { useGitPush } from '../model';

import type { PushButtonProps } from './types';

export const PushButton: FC<PushButtonProps> = ({
  repoPath,
  branchName,
  variant = 'secondary',
  disabled = false,
  className,
  count
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
  const buttonVariant = variant === 'outline' ? 'secondary' : variant;

  return (
    <Button
      type="button"
      variant={buttonVariant}
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
      {typeof count === 'number' && count > 0 ? (
        <span
          className={cn(
            'ml-1 rounded px-1.5 py-0.5 font-mono text-xs font-medium',
            variant === 'primary'
              ? 'bg-primary-foreground/20 text-primary-foreground'
              : 'bg-surface-elevated text-foreground'
          )}
        >
          ↑{count}
        </span>
      ) : null}
    </Button>
  );
};

PushButton.displayName = 'PushButton';
