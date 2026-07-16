import type { FC } from 'react';

import type { AccountsPageProps } from '../types';

export const AccountsPage: FC<AccountsPageProps> = () => {
  return (
    <div className="flex h-full w-full flex-col gap-4 p-6">
      <header className="flex items-center justify-between">
        <h1 className="text-foreground text-2xl font-semibold">Accounts</h1>
      </header>
      <div className="border-border bg-muted/30 flex flex-1 items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <p className="text-muted-foreground text-sm">
          Connect your GitHub or GitLab account.
        </p>
      </div>
    </div>
  );
};
