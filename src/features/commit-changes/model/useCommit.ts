import {
  useMutation,
  useQueryClient,
  type UseMutationResult
} from '@tanstack/react-query';

import { useSelectedFiles } from '@/entities/file-change';
import { useToast } from '@/shared/ui';

import type { CommitInput, CommitMessage, CommitResult } from './types';

const COMMIT_QUERY_KEYS = ['commits', 'git-status'] as const;

const formatCommitMessage = (message: CommitMessage): string => {
  const parts = [message.header];
  if (message.body) parts.push(message.body);
  if (message.footer) parts.push(message.footer);
  return parts.join('\n\n');
};

const invokeCommit = async (
  repoPath: string,
  files: string[] | undefined,
  input: CommitInput
): Promise<CommitResult> => {
  if (typeof window === 'undefined' || !('api' in window)) {
    throw new Error('IPC bridge is unavailable');
  }

  const args: {
    repoPath: string;
    message: string;
    files?: string[];
    noVerify?: boolean;
  } = {
    repoPath,
    message: formatCommitMessage(input.message)
  };

  if (files && files.length > 0) {
    args.files = files;
  }

  if (input.bypassHooks) {
    args.noVerify = true;
  }

  const result = (await window.api.gitCommit(args)) as CommitResult | null;

  if (!result || typeof result.hash !== 'string') {
    throw new Error('Commit failed: invalid response from IPC');
  }

  return result;
};

export type UseCommitResult = {
  mutate: UseMutationResult<
    CommitResult,
    Error,
    CommitInput
  >['mutate'];
  mutateAsync: UseMutationResult<
    CommitResult,
    Error,
    CommitInput
  >['mutateAsync'];
  isPending: boolean;
  isError: boolean;
  error: Error | null;
  reset: () => void;
};

export const useCommit = (repoPath: string): UseCommitResult => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { selected } = useSelectedFiles(repoPath);

  const mutation = useMutation<CommitResult, Error, CommitInput>({
    mutationFn: (input) => invokeCommit(repoPath, selected, input),
    onSuccess: (_data, variables) => {
      for (const key of COMMIT_QUERY_KEYS) {
        void queryClient.invalidateQueries({ queryKey: [key, repoPath] });
      }

      toast.success({
        title: 'Commit created',
        description: variables.message.header
      });
    },
    onError: (err) => {
      toast.error({
        title: 'Commit failed',
        description: err.message
      });
    }
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    reset: () => {
      mutation.reset();
    }
  };
};
