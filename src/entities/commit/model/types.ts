export type { Commit, CommitAuthor } from '@electron/shared/types/git';

export type CommitRowData = {
  hash: string;
  shortHash: string;
  subject: string;
  author: { name: string; email: string };
  date: number;
};
