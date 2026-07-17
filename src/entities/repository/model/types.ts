export type RepositoryStatus = 'clean' | 'dirty' | 'unknown';

export type Repository = {
  id: string;
  path: string;
  name: string;
  status: RepositoryStatus;
  currentBranch: string | null;
  hasRemote: boolean;
  remoteUrl: string | null;
  sizeBytes: number | null;
  gitBytes: number | null;
  iconPath: string | null;
};