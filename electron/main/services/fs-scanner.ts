import { createHash } from 'node:crypto';
import { promises as fs } from 'node:fs';
import type { Dirent } from 'node:fs';
import path from 'node:path';

import type {
  FsBuildRepoIdArgs,
  FsDetectReposArgs,
  FsScanReposArgs
} from '../../shared/schemas';

const GIT_DIR = '.git';

const DEFAULT_DETECT_MAX_DEPTH = 5;
const DEFAULT_SCAN_MAX_DEPTH = 6;

const ID_HASH_PREFIX = 16;

const isGitDir = (entry: Dirent): boolean =>
  entry.isDirectory() && entry.name === GIT_DIR;

const detectShouldSkip = (entry: Dirent): boolean => {
  if (entry.name.startsWith('.')) {
    return entry.name !== GIT_DIR;
  }
  return false;
};

const scanShouldSkip = (entry: Dirent): boolean => {
  if (!entry.isDirectory()) return false;
  if (entry.name.startsWith('.')) {
    return entry.name !== GIT_DIR;
  }
  return false;
};

const walk = async (
  rootPath: string,
  depth: number,
  maxDepth: number,
  shouldSkip: (entry: Dirent) => boolean,
  results: string[]
): Promise<void> => {
  if (depth > maxDepth) return;

  let entries: Dirent[];
  try {
    entries = await fs.readdir(rootPath, { withFileTypes: true });
  } catch {
    return;
  }

  const subdirs: string[] = [];

  for (const entry of entries) {
    if (entry.isSymbolicLink()) continue;
    if (isGitDir(entry)) {
      results.push(rootPath);
      return;
    }
    if (!entry.isDirectory()) continue;
    if (shouldSkip(entry)) continue;
    subdirs.push(path.join(rootPath, entry.name));
  }

  await Promise.all(
    subdirs.map((subdir) => walk(subdir, depth + 1, maxDepth, shouldSkip, results))
  );
};

const scanTree = async (
  rootPath: string,
  maxDepth: number,
  shouldSkip: (entry: Dirent) => boolean
): Promise<string[]> => {
  const results: string[] = [];

  if (!rootPath) return results;

  const absolute = path.resolve(rootPath);

  try {
    const stat = await fs.stat(absolute);
    if (!stat.isDirectory()) return results;
  } catch {
    return results;
  }

  await walk(absolute, 0, maxDepth, shouldSkip, results);
  return results;
};

export const detectRepos = async (args: FsDetectReposArgs): Promise<string[]> =>
  scanTree(args.path, args.maxDepth ?? DEFAULT_DETECT_MAX_DEPTH, detectShouldSkip);

export const scanRepos = async (args: FsScanReposArgs): Promise<string[]> =>
  scanTree(args.path, args.maxDepth ?? DEFAULT_SCAN_MAX_DEPTH, scanShouldSkip);

export const buildRepoId = async (args: FsBuildRepoIdArgs): Promise<string> => {
  const normalized = path.resolve(args.path);
  return createHash('sha1').update(normalized).digest('hex').slice(0, ID_HASH_PREFIX);
};