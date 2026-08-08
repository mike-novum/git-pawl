import type { FC } from 'react';
import { GitBranch, RefreshCw } from 'lucide-react';

import { Button, useToast } from '@/shared/ui';

import { useGitFetch } from '../model';

import type { FetchButtonProps } from './types';

export const FetchButton: FC<FetchButtonProps> = ({
  repoPath,
  branchName,
  disabled = false,
  className,
  iconOnly = false
}) => {
  const toast = useToast();
  const { mutate, isPending } = useGitFetch();

  const handleClick = (): void => {
    if (!repoPath || isPending) return;
    mutate(
      { repoPath },
      {
        onSuccess: () => {
          toast.success({
            title: 'Фетч выполнен'
          });
        },
        onError: (err) => {
          toast.error({
            title: 'Не удалось выполнить fetch',
            description: err.message
          });
        }
      }
    );
  };

  const isDisabled = disabled || isPending || !repoPath;
  const iconClass = isPending ? 'size-4 animate-spin' : 'size-4';
  const refreshIcon = <RefreshCw aria-hidden="true" className={iconClass} />;

  if (iconOnly) {
    return (
      <Button
        type="button"
        variant="ghost"
        onClick={handleClick}
        disabled={isDisabled}
        aria-label="Fetch"
        className={className}
      >
        {refreshIcon}
      </Button>
    );
  }

  const label = branchName ?? 'current';

  return (
    <Button
      type="button"
      variant="secondary"
      onClick={handleClick}
      disabled={isDisabled}
      leftIcon={<GitBranch aria-hidden="true" className="size-4" />}
      rightIcon={refreshIcon}
      className={className}
    >
      {label}
    </Button>
  );
};

FetchButton.displayName = 'FetchButton';
