import { useMemo, useState } from 'react';
import type { FC } from 'react';
import { Check, ChevronDown, LogOut, Plus } from 'lucide-react';

import { AccountAvatar } from '@/entities/account';
import { ConnectAccountDialog } from '@/features/auth-login';
import { useToast } from '@/shared/ui';
import {
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuPositioner,
  DropdownMenuRoot,
  DropdownMenuSeparator,
  DropdownMenuSubmenuTrigger,
  DropdownMenuTrigger
} from '@/shared/ui/dropdown-menu';

import { useAccountSwitcher } from '../model';

import type { AccountSwitcherMenuProps } from './types';

export const AccountSwitcherMenu: FC<AccountSwitcherMenuProps> = ({
  className
}) => {
  const {
    accounts,
    activeAccountId,
    active,
    isSwitching,
    isRemoving,
    setActive,
    remove
  } = useAccountSwitcher();
  const toast = useToast();
  const [addOpen, setAddOpen] = useState(false);

  const others = useMemo(
    () =>
      activeAccountId
        ? accounts.filter((account) => account.id !== activeAccountId)
        : accounts,
    [accounts, activeAccountId]
  );

  const handleSwitch = (id: string, login: string): void => {
    if (id === activeAccountId) return;
    setActive(id);
    toast.success({
      title: 'Active account changed',
      description: `@${login}`
    });
  };

  const handleRemove = (id: string, login: string): void => {
    remove(id);
    toast.success({
      title: 'Account disconnected',
      description: `@${login}`
    });
  };

  return (
    <>
      <DropdownMenuRoot>
        <DropdownMenuTrigger
          aria-label={
            active ? `Active account: @${active.login}` : 'Switch account'
          }
          className={className}
        >
          {active ? (
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-2 py-1 text-sm">
              <AccountAvatar
                login={active.login}
                avatarUrl={active.avatarUrl}
                size="sm"
              />
              <span className="truncate font-medium">{active.login}</span>
              <ChevronDown
                aria-hidden="true"
                className="text-muted-foreground size-4"
              />
            </span>
          ) : (
            <span className="text-muted-foreground inline-flex items-center gap-2 rounded-full border border-dashed border-border bg-card px-3 py-1 text-sm">
              <Plus aria-hidden="true" className="size-4" />
              <span className="truncate font-medium">Add account</span>
            </span>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuPositioner sideOffset={6} align="end">
            <DropdownMenuContent className="min-w-64">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Active</DropdownMenuLabel>
                {active ? (
                  <DropdownMenuSubmenuTrigger disabled={isSwitching}>
                    <AccountAvatar
                      login={active.login}
                      avatarUrl={active.avatarUrl}
                      size="sm"
                    />
                    <span className="flex-1 truncate text-left font-medium">
                      {active.login}
                    </span>
                    <Check aria-hidden="true" className="text-primary size-4" />
                    <DropdownMenuPortal>
                      <DropdownMenuPositioner sideOffset={4} alignOffset={-4}>
                        <DropdownMenuContent className="min-w-44">
                          <DropdownMenuItem
                            disabled={isRemoving}
                            onClick={() =>
                              handleRemove(active.id, active.login)
                            }
                          >
                            <LogOut
                              aria-hidden="true"
                              className="text-muted-foreground size-4"
                            />
                            Disconnect
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenuPositioner>
                    </DropdownMenuPortal>
                  </DropdownMenuSubmenuTrigger>
                ) : (
                  <DropdownMenuItem disabled className="text-muted-foreground">
                    No active account
                  </DropdownMenuItem>
                )}
              </DropdownMenuGroup>

              {others.length > 0 ? (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Other accounts</DropdownMenuLabel>
                    {others.map((account) => (
                      <DropdownMenuSubmenuTrigger
                        key={account.id}
                        disabled={isSwitching || isRemoving}
                      >
                        <AccountAvatar
                          login={account.login}
                          avatarUrl={account.avatarUrl}
                          size="sm"
                        />
                        <span className="flex-1 truncate text-left font-medium">
                          {account.login}
                        </span>
                        <DropdownMenuPortal>
                          <DropdownMenuPositioner
                            sideOffset={4}
                            alignOffset={-4}
                          >
                            <DropdownMenuContent className="min-w-44">
                              <DropdownMenuItem
                                onClick={() =>
                                  handleSwitch(account.id, account.login)
                                }
                              >
                                <Check
                                  aria-hidden="true"
                                  className="text-muted-foreground size-4"
                                />
                                Set as active
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                disabled={isRemoving}
                                onClick={() =>
                                  handleRemove(account.id, account.login)
                                }
                              >
                                <LogOut
                                  aria-hidden="true"
                                  className="text-muted-foreground size-4"
                                />
                                Disconnect
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenuPositioner>
                        </DropdownMenuPortal>
                      </DropdownMenuSubmenuTrigger>
                    ))}
                  </DropdownMenuGroup>
                </>
              ) : null}

              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setAddOpen(true)}>
                <Plus
                  aria-hidden="true"
                  className="text-muted-foreground size-4"
                />
                Add account...
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenuPositioner>
        </DropdownMenuPortal>
      </DropdownMenuRoot>

      <ConnectAccountDialog open={addOpen} onOpenChange={setAddOpen} />
    </>
  );
};

AccountSwitcherMenu.displayName = 'AccountSwitcherMenu';