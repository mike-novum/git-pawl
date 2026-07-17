export type AccountProvider = 'github' | 'gitlab';

export type Account = {
  id: string;
  provider: AccountProvider;
  login: string;
  displayName: string;
  avatarUrl: string | null;
  email: string | null;
  scopes: string[];
  addedAt: number;
};

export type AccountListResult = Account[];

export type AccountSetActiveArgs = { id: string };

export type AccountRemoveArgs = { id: string };
