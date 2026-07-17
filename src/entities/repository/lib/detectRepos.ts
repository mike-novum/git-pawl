import { promises as fs, type Dirent } from 'node:fs';
import path from 'node:path';

export type DetectReposOptions = {
  maxDepth?: number;
  signal?: AbortSignal;
};

const DEFAULT_MAX_DEPTH = 5;

const GIT_DIR = '.git';

const isGitDir = (entry: Dirent): boolean =>
  entry.isDirectory() && entry.name === GIT_DIR;

const shouldSkip = (entry: Dirent): boolean => {
  if (entry.name.startsWith('.')) {
    return entry.name !== GIT_DIR;
  }
  return false;
};

const walk = async (
  rootPath: string,
  depth: number,
  maxDepth: number,
  signal: AbortSignal | undefined,
  results: string[]
): Promise<void> => {
  if (signal?.aborted) return;
  if (depth > maxDepth) return;

  let entries: Dirent[];
  try {
    entries = await fs.readdir(rootPath, { withFileTypes: true });
  } catch {
    return;
  }

  const subdirs: string[] = [];

  for (const entry of entries) {
    if (signal?.aborted) return;
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
    subdirs.map((subdir) => walk(subdir, depth + 1, maxDepth, signal, results))
  );
};

export const detectRepos = async (
  rootPath: string,
  opts?: DetectReposOptions
): Promise<string[]> => {
  const maxDepth = opts?.maxDepth ?? DEFAULT_MAX_DEPTH;
  const signal = opts?.signal;
  const results: string[] = [];

  if (!rootPath) return results;

  const absolute = path.resolve(rootPath);

  try {
    const stat = await fs.stat(absolute);
    if (!stat.isDirectory()) return results;
  } catch {
    return results;
  }

  await walk(absolute, 0, maxDepth, signal, results);
  return results;
};