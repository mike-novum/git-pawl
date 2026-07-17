import { Plus } from 'lucide-react';
import { useState } from 'react';
import type { FC } from 'react';

import { useAppStore } from '@/app/store';
import { useAccountList } from '@/entities/account';
import { useAccountSwitcher } from '@/features/auth-switch';
import { ConnectAccountDialog } from '@/features/auth-login';
import { Button, Spinner, useToast } from '@/shared/ui';

import { AccountListSection } from './AccountListSection';
import { EmptyState } from './EmptyState';
import type { AccountsPageProps } from './types';

export const AccountsPage: FC<AccountsPageProps> = () => {
  const [addOpen, setAddOpen] = useState(false);
  const toast = useToast();

  const { data, isLoading } = useAccountList();
  const { setActive, remove } = useAccountSwitcher();
  const activeAccountId = useAppStore((state) => state.activeAccountId);

  const accounts = data ?? [];

  const handleSetActive = (id: string): void => {
    if (id === activeAccountId) return;
    const target = accounts.find((account) => account.id === id);
    setActive(id);
    toast.success({
      title: 'Active account changed',
      description: target ? `@${target.login}` : undefined
    });
  };

  const handleDisconnect = (id: string): void => {
    const target = accounts.find((account) => account.id === id);
    remove(id);
    toast.success({
      title: 'Account disconnected',
      description: target ? `@${target.login}` : undefined
    });
  };

  const handleAddAccount = (): void => {
    setAddOpen(true);
  };

  return (
    <div className="flex h-full w-full flex-col gap-6 overflow-y-auto p-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-foreground text-2xl font-semibold tracking-tight">
            Accounts
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage connected GitHub and GitLab accounts. The active account is
            used for new clones and push operations.
          </p>
        </div>
        <Button variant="primary" onClick={handleAddAccount}>
          <Plus aria-hidden="true" className="size-4" />
          Add account
        </Button>
      </header>

      {isLoading ? (
        <div className="flex flex-1 items-center justify-center" role="status" aria-label="Loading accounts">
          <Spinner size="lg" />
        </div>
      ) : accounts.length === 0 ? (
        <EmptyState onConnect={handleAddAccount} />
      ) : (
        <AccountListSection
          accounts={accounts}
          activeAccountId={activeAccountId}
          onSetActive={handleSetActive}
          onDisconnect={handleDisconnect}
        />
      )}

      <ConnectAccountDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
};

AccountsPage.displayName = 'AccountsPage';