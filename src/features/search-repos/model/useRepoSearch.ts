import { useEffect, useMemo, useState } from 'react';

import type { Repository } from '@/entities/repository';

const DEBOUNCE_MS = 150;

const normalize = (value: string): string => value.toLowerCase().trim();

const filterRepos = (repos: Repository[], query: string): Repository[] => {
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
  results: Repository[];
};

export const useRepoSearch = (repos: Repository[]): UseRepoSearchResult => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, DEBOUNCE_MS);
    return () => {
      clearTimeout(timer);
    };
  }, [query]);

  const results = useMemo(() => filterRepos(repos, debouncedQuery), [repos, debouncedQuery]);

  return { query, setQuery, results };
};