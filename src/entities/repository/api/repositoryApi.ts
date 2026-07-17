import type { GitStatus } from '@electron/shared/types/git';
import type { RepoSize } from '@electron/shared/types/fs';

import { gitStatus, fsSize, gitRevParse } from '@/shared/api';

export type { GitStatus, RepoSize };

export const getStatus = (repoPath: string): Promise<GitStatus | null> =>
  gitStatus({ repoPath }) as Promise<GitStatus | null>;

export const getSize = (repoPath: string): Promise<RepoSize> =>
  fsSize({ repoPath }) as Promise<RepoSize>;

export const getBranch = (repoPath: string): Promise<string | null> =>
  gitRevParse({ repoPath })
    .then((r) => (r ? String(r) : null))
    .catch(() => null);