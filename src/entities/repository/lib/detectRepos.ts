import { fsDetectRepos } from '@/shared/api';

export type DetectReposOptions = {
  maxDepth?: number;
  signal?: AbortSignal;
};

const ROOT_PATH_REQUIRED: { message: string } = {
  message: 'rootPath is required'
};

export const detectRepos = async (
  rootPath: string,
  opts?: DetectReposOptions
): Promise<string[]> => {
  if (!rootPath) {
    throw new Error(ROOT_PATH_REQUIRED.message);
  }
  if (opts?.signal?.aborted) {
    return [];
  }

  const result = await fsDetectRepos({
    path: rootPath,
    ...(opts?.maxDepth !== undefined ? { maxDepth: opts.maxDepth } : {})
  });

  if (opts?.signal?.aborted) {
    return [];
  }
  return result;
};