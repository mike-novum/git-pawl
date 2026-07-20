import { BrowserWindow, dialog } from 'electron';
import { randomUUID } from 'node:crypto';
import { promises as fs, type Dirent } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

import type {
  FsIconRemoveArgs,
  FsIconSetArgs,
  FsSizeArgs,
  FsWorkspaceCreateArgs,
  FsWorkspaceRemoveArgs,
  FsWorkspaceSizeArgs
} from '../../shared/schemas';
import type { RepoSize, Workspace } from '../../shared/types/fs';

import { storeGet, storeSet } from './store';

const WORKSPACE_STORE_KEY = 'workspaces';

const WALK_CONCURRENCY = 16;

const ICON_SIZE = 256;

const ICON_EXTENSIONS = ['.png', '.jpg', '.jpeg'] as const;

const ensureDirectoryExists = async (input: string): Promise<string> => {
  const resolved = path.resolve(input);
  const stat = await fs.stat(resolved);
  if (!stat.isDirectory()) {
    throw new Error(`Not a directory: ${resolved}`);
  }
  return resolved;
};

const pickWindow = (): BrowserWindow | undefined => {
  const focused = BrowserWindow.getFocusedWindow();
  if (focused) return focused;
  const all = BrowserWindow.getAllWindows();
  return all.length > 0 ? all[0] : undefined;
};

export const selectDirectory = async (): Promise<string | null> => {
  const win = pickWindow();
  const options = { properties: ['openDirectory', 'createDirectory'] as Array<
    'openDirectory' | 'createDirectory'
  > };
  const result = win
    ? await dialog.showOpenDialog(win, options)
    : await dialog.showOpenDialog(options);
  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }
  return result.filePaths[0];
};

export const getRepoSize = async (args: FsSizeArgs): Promise<RepoSize> => {
  const repoPath = await ensureDirectoryExists(args.repoPath);

  const result: RepoSize = { totalBytes: 0, fileCount: 0, gitBytes: 0 };

  const isInsideGitObjects = (fullPath: string): boolean => {
    const rel = path.relative(repoPath, fullPath);
    if (rel.startsWith('..') || path.isAbsolute(rel)) return false;
    const parts = rel.split(path.sep);
    return parts[0] === '.git' && parts[1] === 'objects';
  };

  const dirs: string[] = [repoPath];
  const inFlight: Set<Promise<void>> = new Set();

  const processDir = async (dir: string): Promise<void> => {
    let entries: Dirent[];
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      if (entry.isSymbolicLink()) continue;

      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        dirs.push(fullPath);
      } else if (entry.isFile()) {
        try {
          const stat = await fs.stat(fullPath);
          if (isInsideGitObjects(fullPath)) {
            result.gitBytes += stat.size;
          } else {
            result.totalBytes += stat.size;
            result.fileCount += 1;
          }
        } catch {
          continue;
        }
      }
    }
  };

  while (dirs.length > 0 || inFlight.size > 0) {
    while (inFlight.size < WALK_CONCURRENCY && dirs.length > 0) {
      const nextDir = dirs.shift() as string;
      const promise = processDir(nextDir).finally(() => {
        inFlight.delete(promise);
      });
      inFlight.add(promise);
    }
    if (inFlight.size > 0) {
      await Promise.race(inFlight);
    }
  }

  return result;
};

export type WorkspaceSizeResult = { totalBytes: number };

const WORKSPACE_SKIP_DIRS = new Set(['node_modules', '.git']);

export const getWorkspaceSize = async (
  args: FsWorkspaceSizeArgs
): Promise<WorkspaceSizeResult> => {
  const wsPath = await ensureDirectoryExists(args.workspacePath);

  let totalBytes = 0;
  const dirs: string[] = [wsPath];
  const inFlight: Set<Promise<void>> = new Set();

  const processDir = async (dir: string): Promise<void> => {
    let entries: Dirent[];
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      if (entry.isSymbolicLink()) continue;
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (WORKSPACE_SKIP_DIRS.has(entry.name)) continue;
        dirs.push(fullPath);
      } else if (entry.isFile()) {
        try {
          const stat = await fs.stat(fullPath);
          totalBytes += stat.size;
        } catch {
          continue;
        }
      }
    }
  };

  while (dirs.length > 0 || inFlight.size > 0) {
    while (inFlight.size < WALK_CONCURRENCY && dirs.length > 0) {
      const nextDir = dirs.shift() as string;
      const promise = processDir(nextDir).finally(() => {
        inFlight.delete(promise);
      });
      inFlight.add(promise);
    }
    if (inFlight.size > 0) {
      await Promise.race(inFlight);
    }
  }

  return { totalBytes };
};

const resolveIconExtension = (sourcePath: string): '.png' | '.jpg' => {
  const ext = path.extname(sourcePath).toLowerCase();
  return ext === '.jpg' || ext === '.jpeg' ? '.jpg' : '.png';
};

const iconPathFor = (repoPath: string, ext: '.png' | '.jpg'): string =>
  path.join(repoPath, `icon${ext}`);

export const setRepoIcon = async (args: FsIconSetArgs): Promise<void> => {
  const repoPath = await ensureDirectoryExists(args.repoPath);

  let sourceStat;
  try {
    sourceStat = await fs.stat(args.sourceImagePath);
  } catch {
    throw new Error(`Source image not found: ${args.sourceImagePath}`);
  }
  if (!sourceStat.isFile()) {
    throw new Error(`Source image is not a file: ${args.sourceImagePath}`);
  }

  const ext = resolveIconExtension(args.sourceImagePath);
  const targetPath = iconPathFor(repoPath, ext);

  for (const otherExt of ICON_EXTENSIONS) {
    if (otherExt === ext) continue;
    try {
      await fs.unlink(path.join(repoPath, `icon${otherExt}`));
    } catch (err) {
      if ((err as { code?: string }).code !== 'ENOENT') {
        throw err;
      }
    }
  }

  await sharp(args.sourceImagePath)
    .resize(ICON_SIZE, ICON_SIZE, { fit: 'cover' })
    .toFile(targetPath);
};

export const removeRepoIcon = async (args: FsIconRemoveArgs): Promise<void> => {
  const repoPath = await ensureDirectoryExists(args.repoPath);

  for (const ext of ICON_EXTENSIONS) {
    try {
      await fs.unlink(path.join(repoPath, `icon${ext}`));
    } catch (err) {
      if ((err as { code?: string }).code !== 'ENOENT') {
        throw err;
      }
    }
  }
};

const readWorkspaces = (): Workspace[] => {
  const raw = storeGet<unknown>(WORKSPACE_STORE_KEY);
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (item): item is Workspace =>
      typeof item === 'object' &&
      item !== null &&
      typeof (item as Workspace).id === 'string' &&
      typeof (item as Workspace).name === 'string' &&
      typeof (item as Workspace).path === 'string' &&
      typeof (item as Workspace).createdAt === 'number'
  );
};

const writeWorkspaces = (list: Workspace[]): void => {
  storeSet(WORKSPACE_STORE_KEY, list);
};

export const workspaceList = async (): Promise<Workspace[]> => readWorkspaces();

export const workspaceCreate = async (
  args: FsWorkspaceCreateArgs
): Promise<Workspace> => {
  const wsPath = await ensureDirectoryExists(args.path);

  const list = readWorkspaces();
  const existing = list.find((w) => w.path === wsPath);
  if (existing) {
    return existing;
  }

  const name = args.name?.trim() || path.basename(wsPath);

  const workspace: Workspace = {
    id: randomUUID(),
    name,
    path: wsPath,
    createdAt: Date.now()
  };

  list.push(workspace);
  writeWorkspaces(list);

  return workspace;
};

export const workspaceRemove = async (
  args: FsWorkspaceRemoveArgs
): Promise<void> => {
  const list = readWorkspaces();
  const next = list.filter((w) => w.id !== args.id);
  if (next.length === list.length) {
    return;
  }
  writeWorkspaces(next);
};
