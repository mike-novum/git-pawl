import type { FC, KeyboardEvent } from 'react';

import { cn } from '@/shared/lib/theme';

import { AccountAvatar } from './AccountAvatar';
import type { AccountBadgeProps } from './types';

const handleKeyDown = (
  event: KeyboardEvent<HTMLDivElement>,
  onSelect: ((id: string) => void) | undefined,
  id: string
): void => {
  if (!onSelect) return;
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    onSelect(id);
  }
};

export const AccountBadge: FC<AccountBadgeProps> = ({
  account,
  active = false,
  onSelect,
  className
}) => {
  const handleClick = (): void => {
    if (onSelect) onSelect(account.id);
  };

  return (
    <div
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
      aria-pressed={onSelect ? active : undefined}
      aria-label={`Account ${account.login}`}
      onClick={onSelect ? handleClick : undefined}
      onKeyDown={
        onSelect ? (event) => handleKeyDown(event, onSelect, account.id) : undefined
      }
      className={cn(
        'inline-flex items-center gap-2 rounded-full border border-border bg-card px-2 py-1 text-sm',
        onSelect &&
          'hover:bg-muted/60 focus-visible:ring-ring cursor-pointer focus:outline-none focus-visible:ring-2',
        active && 'border-primary text-foreground',
        className
      )}
    >
      <AccountAvatar
        login={account.login}
        avatarUrl={account.avatarUrl}
        size="sm"
      />
      <span className="truncate font-medium">{account.login}</span>
    </div>
  );
};
