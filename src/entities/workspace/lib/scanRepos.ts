import { fsScanRepos } from '@/shared/api';

export type ScanReposOptions = {
  maxDepth?: number;
  signal?: AbortSignal;
};

const ROOT_PATH_REQUIRED: { message: string } = {
  message: 'workspacePath is required'
};

export const scanRepos = async (
  workspacePath: string,
  opts?: ScanReposOptions
): Promise<string[]> => {
  if (!workspacePath) {
    throw new Error(ROOT_PATH_REQUIRED.message);
  }
  if (opts?.signal?.aborted) {
    return [];
  }

  const result = await fsScanRepos({
    path: workspacePath,
    ...(opts?.maxDepth !== undefined ? { maxDepth: opts.maxDepth } : {})
  });

  if (opts?.signal?.aborted) {
    return [];
  }
  return result;
};