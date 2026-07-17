import type { FC } from 'react';
import { Check } from 'lucide-react';

import { Button } from '@/shared/ui';

import { useCommit } from '../model';

import type { CommitButtonProps } from './types';

export const CommitButton: FC<CommitButtonProps> = ({
  repoPath,
  message,
  bypassHooks = false,
  disabled = false,
  className
}) => {
  const { mutate, isPending } = useCommit(repoPath);

  const headerEmpty = message.header.trim().length === 0;
  const isDisabled = disabled || isPending || headerEmpty || !repoPath;

  const handleClick = (): void => {
    if (isDisabled) return;
    mutate({ message, bypassHooks });
  };

  return (
    <Button
      type="button"
      variant="primary"
      onClick={handleClick}
      disabled={isDisabled}
      loading={isPending}
      leftIcon={<Check aria-hidden="true" className="size-4" />}
      className={className}
    >
      Commit
    </Button>
  );
};

CommitButton.displayName = 'CommitButton';
