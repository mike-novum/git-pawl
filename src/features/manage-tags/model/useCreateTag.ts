import {
  useMutation,
  useQueryClient,
  type UseMutationResult
} from '@tanstack/react-query';

import { tagListQueryKey } from '@/entities/tag';

export type CreateTagInput = {
  repoPath: string;
  name: string;
  target?: string;
  message?: string;
  annotated?: boolean;
  force?: boolean;
};

export type CreateTagResult = void;

const TAG_QUERY_KEYS = ['tag-list', 'tag-list-disabled'] as const;

const invokeCreateTag = async (
  input: CreateTagInput
): Promise<CreateTagResult> => {
  if (typeof window === 'undefined' || !('api' in window)) {
    throw new Error('IPC bridge is unavailable');
  }
  const args: {
    repoPath: string;
    action: 'create';
    name: string;
    target?: string;
    message?: string;
    annotated?: boolean;
    force?: boolean;
  } = {
    repoPath: input.repoPath,
    action: 'create',
    name: input.name
  };
  if (input.target) args.target = input.target;
  if (input.message) args.message = input.message;
  if (input.annotated !== undefined) args.annotated = input.annotated;
  if (input.force !== undefined) args.force = input.force;
  await window.api.gitTag(args);
};

export type UseCreateTagResult = {
  mutate: UseMutationResult<CreateTagResult, Error, CreateTagInput>['mutate'];
  mutateAsync: UseMutationResult<
    CreateTagResult,
    Error,
    CreateTagInput
  >['mutateAsync'];
  isPending: boolean;
  isError: boolean;
  error: Error | null;
  reset: () => void;
};

export const useCreateTag = (): UseCreateTagResult => {
  const queryClient = useQueryClient();

  const mutation = useMutation<CreateTagResult, Error, CreateTagInput>({
    mutationFn: invokeCreateTag,
    onSuccess: (_data, variables) => {
      const { repoPath } = variables;
      void queryClient.invalidateQueries({
        queryKey: tagListQueryKey(repoPath)
      });
      void queryClient.invalidateQueries({ queryKey: [...TAG_QUERY_KEYS] });
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