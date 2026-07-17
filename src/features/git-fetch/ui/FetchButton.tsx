import type { FC } from 'react';
import { GitBranch, RefreshCw } from 'lucide-react';

import { Button, useToast } from '@/shared/ui';

import { useGitFetch } from '../model';

import type { FetchButtonProps } from './types';

export const FetchButton: FC<FetchButtonProps> = ({
  repoPath,
  branchName,
  disabled = false,
  className
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
            title: 'Fetch complete',
            description: 'Remote refs updated'
          });
        },
        onError: (err) => {
          toast.error({
            title: 'Fetch failed',
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
      <RefreshCw aria-hidden="true" className="size-4" />
    </Button>
  );
};

FetchButton.displayName = 'FetchButton';