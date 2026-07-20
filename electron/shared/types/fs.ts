export type RepoSize = { totalBytes: number; fileCount: number; gitBytes: number };

export type FsSelectFileResult = string | null;

export type Workspace = { id: string; name: string; path: string; createdAt: number };
