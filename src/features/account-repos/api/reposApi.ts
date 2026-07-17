import type { RepoInfo } from '../model/types';

const getApi = (): Window['api'] | null => {
  if (typeof window === 'undefined') return null;
  if (!('api' in window)) return null;
  return window.api;
};

const isRepoInfo = (value: unknown): value is RepoInfo => {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.name === 'string' &&
    typeof candidate.fullName === 'string' &&
    typeof candidate.defaultBranch === 'string' &&
    typeof candidate.isPrivate === 'boolean' &&
    typeof candidate.url === 'string'
  );
};

const parseRepos = (raw: unknown): RepoInfo[] => {
  if (!Array.isArray(raw)) return [];
  return raw.filter(isRepoInfo);
};

export const listGitHubRepos = async (
  accountId: string
): Promise<RepoInfo[]> => {
  const api = getApi();
  if (!api?.githubListRepos) return [];
  const result = await api.githubListRepos({ accountId });
  return parseRepos(result);
};

export const listGitLabRepos = async (
  accountId: string
): Promise<RepoInfo[]> => {
  const api = getApi();
  if (!api?.gitlabListRepos) return [];
  const result = await api.gitlabListRepos({ accountId });
  return parseRepos(result);
};