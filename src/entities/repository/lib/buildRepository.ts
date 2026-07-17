import { createHash } from 'node:crypto';
import path from 'node:path';

import type { GitStatus } from '@electron/shared/types/git';
import type { RepoSize } from '@electron/shared/types/fs';

import type { Repository, RepositoryStatus } from '../model/types';

const ICON_FILE = 'icon.png';

const deriveStatus = (status: GitStatus | null): RepositoryStatus => {
  if (!status) return 'unknown';
  return status.clean ? 'clean' : 'dirty';
};

const deriveBranch = (status: GitStatus | null): string | null => {
  if (!status) return null;
  if (status.branch.detached) return null;
  return status.branch.current ?? null;
};

const buildId = (repoPath: string): string => {
  const normalized = path.resolve(repoPath);
  return createHash('sha1').update(normalized).digest('hex').slice(0, 16);
};

export const defaultIconPath = (repoPath: string): string =>
  path.join(repoPath, ICON_FILE);

export const buildRepository = (
  repoPath: string,
  status: GitStatus | null,
  size: RepoSize | null,
  iconPath: string | null
): Repository => {
  const absolutePath = path.resolve(repoPath);
  const name = path.basename(absolutePath);
  const resolvedIconPath = iconPath ?? defaultIconPath(absolutePath);

  return {
    id: buildId(absolutePath),
    path: absolutePath,
    name,
    status: deriveStatus(status),
    currentBranch: deriveBranch(status),
    hasRemote: false,
    remoteUrl: null,
    sizeBytes: size ? size.totalBytes : null,
    gitBytes: size ? size.gitBytes : null,
    iconPath: resolvedIconPath
  };
};