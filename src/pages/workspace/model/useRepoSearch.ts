import { useCallback, useMemo, useState } from 'react';

import type { Repository } from '@/entities/repository';

const normalize = (value: string): string => value.toLowerCase().trim();

export const filterRepos = (repos: Repository[], query: string): Repository[] => {
  const needle = normalize(query);
  if (needle.length === 0) return repos;

  return repos.filter((repo) => {
    if (normalize(repo.name).includes(needle)) return true;
    if (normalize(repo.path).includes(needle)) return true;
    if (repo.remoteUrl && normalize(repo.remoteUrl).includes(needle)) return true;
    return false;
  });
};

export type UseRepoSearchResult = {
  query: string;
  setQuery: (next: string) => void;
  reset: () => void;
  filter: (repos: Repository[]) => Repository[];
};

export const useRepoSearch = (): UseRepoSearchResult => {
  const [query, setQuery] = useState('');

  const filter = useMemo(() => {
    return (repos: Repository[]): Repository[] => filterRepos(repos, query);
  }, [query]);

  const reset = useCallback((): void => {
    setQuery('');
  }, []);

  return { query, setQuery, reset, filter };
};