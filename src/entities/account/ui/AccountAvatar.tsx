import { useState } from 'react';
import type { FC } from 'react';

import { cn } from '@/shared/lib/theme';

import type { AccountAvatarProps, AccountAvatarSize } from './types';

const SIZE_CLASSES: Record<AccountAvatarSize, string> = {
  sm: 'h-6 w-6 text-xs',
  md: 'h-8 w-8 text-sm',
  lg: 'h-10 w-10 text-base'
};

const toInitial = (login: string): string => {
  const trimmed = login.trim();
  if (!trimmed) return '?';
  return trimmed.charAt(0).toUpperCase();
};

export const AccountAvatar: FC<AccountAvatarProps> = ({
  login,
  avatarUrl,
  size = 'md',
  className
}) => {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(avatarUrl) && !failed;

  return (
    <span
      aria-hidden="true"
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-muted-foreground font-medium',
        SIZE_CLASSES[size],
        className
      )}
    >
      {showImage && avatarUrl ? (
        <img
          src={avatarUrl}
          alt=""
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <span>{toInitial(login)}</span>
      )}
    </span>
  );
};
