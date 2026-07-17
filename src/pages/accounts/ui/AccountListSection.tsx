import { useMemo } from 'react';
import type { FC } from 'react';

import type { Account, AccountProvider } from '@/entities/account';

import { AccountRow } from './AccountRow';
import type { AccountListSectionProps, AccountProviderGroup } from './types';

const PROVIDER_LABELS: Record<AccountProvider, string> = {
  github: 'GitHub',
  gitlab: 'GitLab'
};

const PROVIDER_ORDER: AccountProvider[] = ['github', 'gitlab'];

const groupByProvider = (accounts: Account[]): AccountProviderGroup[] => {
  const groups: Record<AccountProvider, Account[]> = {
    github: [],
    gitlab: []
  };

  for (const account of accounts) {
    groups[account.provider].push(account);
  }

  return PROVIDER_ORDER.filter((provider) => groups[provider].length > 0).map(
    (provider) => ({
      provider,
      label: PROVIDER_LABELS[provider],
      accounts: groups[provider]
    })
  );
};

export const AccountListSection: FC<AccountListSectionProps> = ({
  accounts,
  activeAccountId,
  onSetActive,
  onDisconnect
}) => {
  const groups = useMemo(() => groupByProvider(accounts), [accounts]);

  return (
    <div className="flex flex-col gap-6">
      {groups.map((group) => (
        <section key={group.provider} className="flex flex-col gap-3">
          <header className="flex items-center gap-2 px-1">
            <h2 className="text-foreground text-sm font-semibold tracking-tight">
              {group.label}
            </h2>
            <span className="text-muted-foreground text-xs">
              {group.accounts.length}
              {group.accounts.length === 1 ? ' account' : ' accounts'}
            </span>
          </header>
          <div className="flex flex-col gap-2">
            {group.accounts.map((account) => (
              <AccountRow
                key={account.id}
                account={account}
                isActive={account.id === activeAccountId}
                onSetActive={onSetActive}
                onDisconnect={onDisconnect}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};

AccountListSection.displayName = 'AccountListSection';