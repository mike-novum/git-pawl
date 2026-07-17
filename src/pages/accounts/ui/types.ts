import type { Account, AccountProvider } from '@/entities/account';

export type AccountRowProps = {
  account: Account;
  isActive: boolean;
  onSetActive: (id: string) => void;
  onDisconnect: (id: string) => void;
};

export type AccountListSectionProps = {
  accounts: Account[];
  activeAccountId: string | null;
  onSetActive: (id: string) => void;
  onDisconnect: (id: string) => void;
};

export type AccountsEmptyStateProps = {
  onConnect: () => void;
};

export type AccountsPageHeaderProps = {
  onAddAccount: () => void;
};

export type AccountsPageProps = Record<string, never>;

export type AccountProviderGroup = {
  provider: AccountProvider;
  label: string;
  accounts: Account[];
};