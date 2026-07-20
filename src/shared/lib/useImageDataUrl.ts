import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { fsReadImageDataUrl } from '@/shared/api';

const DATA_URL_QUERY_KEY = (path: string): readonly [string, string] =>
  ['image-data-url', path] as const;

const DISABLED_KEY = ['image-data-url', 'disabled'] as const;

const fetchImageDataUrl = async (path: string): Promise<string | null> => {
  try {
    return await fsReadImageDataUrl({ path });
  } catch {
    return null;
  }
};

export const useImageDataUrl = (
  path: string | null
): UseQueryResult<string | null> =>
  useQuery({
    queryKey: path ? DATA_URL_QUERY_KEY(path) : DISABLED_KEY,
    queryFn: () => {
      if (!path) return Promise.resolve<string | null>(null);

      return fetchImageDataUrl(path);
    },
    enabled: Boolean(path),
    staleTime: 5 * 60 * 1000
  });