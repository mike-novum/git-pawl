import { Check, LogOut } from 'lucide-react';
import { useState } from 'react';
import type { FC } from 'react';

import { AccountAvatar } from '@/entities/account';
import { Badge, Button, Dialog } from '@/shared/ui';
import { cn } from '@/shared/lib/theme';

import type { AccountRowProps } from './types';

const PROVIDER_LABELS = {
  github: 'GitHub',
  gitlab: 'GitLab'
} as const;

export const AccountRow: FC<AccountRowProps> = ({
  account,
  isActive,
  onSetActive,
  onDisconnect
}) => {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleSetActive = (): void => {
    onSetActive(account.id);
  };

  const handleDisconnectRequest = (): void => {
    setConfirmOpen(true);
  };

  const handleConfirmDisconnect = (): void => {
    onDisconnect(account.id);
    setConfirmOpen(false);
  };

  return (
    <div
      className={cn(
        'flex items-center gap-4 rounded-lg border border-border bg-card p-4 transition-colors',
        isActive && 'border-primary/50 bg-primary/5'
      )}
    >
      <AccountAvatar
        login={account.login}
        avatarUrl={account.avatarUrl}
        size="lg"
      />

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-semibold text-foreground">
            {account.displayName || account.login}
          </span>
          <Badge variant="outline" size="sm">
            {PROVIDER_LABELS[account.provider]}
          </Badge>
          {isActive ? (
            <Badge variant="success" size="sm">
              <Check aria-hidden="true" className="mr-1 size-3" />
              Active
            </Badge>
          ) : null}
        </div>
        <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs">
          <span className="truncate">@{account.login}</span>
          {account.email ? <span className="truncate">{account.email}</span> : null}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {isActive ? null : (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleSetActive}
            aria-label={`Set @${account.login} as active`}
          >
            Set as active
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDisconnectRequest}
          aria-label={`Disconnect @${account.login}`}
        >
          <LogOut aria-hidden="true" className="size-4" />
          Disconnect
        </Button>
      </div>

      <Dialog.Root open={confirmOpen} onOpenChange={setConfirmOpen}>
        <Dialog.Portal>
          <Dialog.Backdrop />
          <Dialog.Content
            title="Disconnect account?"
            description={`This will remove @${account.login} and revoke its stored credentials. You can reconnect it anytime.`}
          >
            <div className="flex justify-end gap-2">
              <Dialog.Close>
                <Button variant="secondary" size="md">
                  Cancel
                </Button>
              </Dialog.Close>
              <Button variant="destructive" size="md" onClick={handleConfirmDisconnect}>
                Disconnect
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
};

AccountRow.displayName = 'AccountRow';