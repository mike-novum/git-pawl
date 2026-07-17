import { useState } from 'react';
import {
  useMutation,
  useQueryClient,
  type UseMutationResult
} from '@tanstack/react-query';

import { WORKSPACE_LIST_QUERY_KEY } from '@/entities/workspace';

export type CloneRepoInput = {
  url: string;
  destPath: string;
};

export type CloneRepoResult = void;

const getBridge = (): Window['api'] | null => {
  if (typeof window === 'undefined') return null;
  if (!('api' in window)) return null;
  return window.api;
};

const invokeClone = async (input: CloneRepoInput): Promise<CloneRepoResult> => {
  const bridge = getBridge();
  if (!bridge?.gitClone) {
    throw new Error('IPC bridge is unavailable');
  }
  await bridge.gitClone({ url: input.url, destPath: input.destPath });
};

const PROGRESS_LISTENER_KEY = 'onCloneProgress';

type ProgressBridge = {
  [PROGRESS_LISTENER_KEY]?: (
    cb: (payload: { message: string }, meta: { url: string }) => void
  ) => () => void;
};

const subscribeProgress = (
  input: CloneRepoInput,
  onMessage: (message: string) => void
): (() => void) => {
  if (typeof window === 'undefined') return () => undefined;
  const bridge = window as unknown as Window & { api?: ProgressBridge };
  const listener = bridge.api?.[PROGRESS_LISTENER_KEY];
  if (!listener) return () => undefined;
  try {
    const unsubscribe = listener((payload, meta) => {
      if (meta?.url !== input.url) return;
      if (payload && typeof payload.message === 'string') {
        onMessage(payload.message);
      }
    }, );
    return typeof unsubscribe === 'function' ? unsubscribe : () => undefined;
  } catch {
    return () => undefined;
  }
};

export type UseCloneRepoResult = {
  mutate: UseMutationResult<CloneRepoResult, Error, CloneRepoInput>['mutate'];
  mutateAsync: UseMutationResult<
    CloneRepoResult,
    Error,
    CloneRepoInput
  >['mutateAsync'];
  isPending: boolean;
  isError: boolean;
  error: Error | null;
  progress: string | null;
  reset: () => void;
};

export const useCloneRepo = (): UseCloneRepoResult => {
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState<string | null>(null);

  const mutation = useMutation<CloneRepoResult, Error, CloneRepoInput>({
    mutationFn: async (input) => {
      const unsubscribe = subscribeProgress(input, (message) => {
        setProgress(message);
      });
      try {
        await invokeClone(input);
      } finally {
        unsubscribe();
      }
    },
    onMutate: () => {
      setProgress(null);
    },
    onSuccess: () => {
      setProgress(null);
      void queryClient.invalidateQueries({
        queryKey: WORKSPACE_LIST_QUERY_KEY
      });
      void queryClient.invalidateQueries({
        queryKey: ['repository-list']
      });
    },
    onError: () => {
      setProgress(null);
    }
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    progress,
    reset: () => {
      mutation.reset();
      setProgress(null);
    }
  };
};
