import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { shellDetectAgents } from '@/shared/api';

import type { AvailableAgent } from '../ui/types';

const AGENTS_QUERY_KEY = ['shell-detect-agents'] as const;

const fetchAgents = async (): Promise<AvailableAgent[]> => shellDetectAgents();

export const useAvailableAgents = (): UseQueryResult<AvailableAgent[]> => {
  const result = useQuery({
    queryKey: AGENTS_QUERY_KEY,
    queryFn: fetchAgents,
    staleTime: 60_000,
    refetchOnWindowFocus: false
  });
  return result;
};