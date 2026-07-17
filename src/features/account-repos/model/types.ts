export type AccountReposProvider = 'github' | 'gitlab';

export type RepoInfo = {
  id: string;
  name: string;
  fullName: string;
  defaultBranch: string;
  isPrivate: boolean;
  url: string;
};

export type RepoListPage = {
  items: RepoInfo[];
  nextPage: number | null;
};

export type AccountReposArgs = {
  provider: AccountReposProvider;
  accountId: string;
};