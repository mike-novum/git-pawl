import type { GitStatus } from '@electron/shared/types/git';
import type { RepoSize } from '@electron/shared/types/fs';

import { fsBuildRepoId } from '@/shared/api';

import type { Repository, RepositoryStatus } from '../model/types';

const ICON_FILE = 'icon.png';

const ID_HASH_PREFIX_LENGTH = 16;

const deriveStatus = (status: GitStatus | null): RepositoryStatus => {
  if (!status) return 'unknown';
  return status.clean ? 'clean' : 'dirty';
};

const deriveBranch = (status: GitStatus | null): string | null => {
  if (!status) return null;
  if (status.branch.detached) return null;
  return status.branch.current ?? null;
};

const lastSegment = (input: string): string => {
  const trimmed = input.replace(/[/\\]+$/, '');
  const parts = trimmed.split(/[/\\]/);
  return parts[parts.length - 1] ?? trimmed;
};

const fallbackId = (repoPath: string): string => {
  let hash = 0;
  for (let i = 0; i < repoPath.length; i += 1) {
    hash = (hash * 31 + repoPath.charCodeAt(i)) | 0;
  }
  const hex = (hash >>> 0).toString(16).padStart(8, '0');
  return (hex + hex + hex + hex).slice(0, ID_HASH_PREFIX_LENGTH);
};

export const defaultIconPath = (repoPath: string): string => {
  const trimmed = repoPath.replace(/[/\\]+$/, '');
  return `${trimmed}/${ICON_FILE}`;
};

export const buildRepository = async (
  repoPath: string,
  status: GitStatus | null,
  size: RepoSize | null,
  iconPath: string | null
): Promise<Repository> => {
  const absolutePath = repoPath;
  const name = lastSegment(absolutePath);
  const resolvedIconPath = iconPath ?? defaultIconPath(absolutePath);

  let id: string;
  try {
    id = await fsBuildRepoId({ path: absolutePath });
  } catch {
    id = fallbackId(absolutePath);
  }

  return {
    id,
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