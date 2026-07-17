import type { FC } from 'react';

import type { Account } from '../model/types';

export type AccountAvatarSize = 'sm' | 'md' | 'lg';

export type AccountAvatarProps = {
  login: string;
  avatarUrl: string | null;
  size?: AccountAvatarSize;
  className?: string;
};

export type AccountBadgeProps = {
  account: Pick<Account, 'id' | 'login' | 'displayName' | 'avatarUrl'>;
  active?: boolean;
  onSelect?: (id: string) => void;
  className?: string;
};

export type FC_AccountAvatar = FC<AccountAvatarProps>;
export type FC_AccountBadge = FC<AccountBadgeProps>;
