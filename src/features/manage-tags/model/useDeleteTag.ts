import {
  useMutation,
  useQueryClient,
  type UseMutationResult
} from '@tanstack/react-query';

import { tagListQueryKey } from '@/entities/tag';

export type DeleteTagInput = {
  repoPath: string;
  name: string;
};

export type DeleteTagResult = void;

const invokeDeleteTag = async (
  input: DeleteTagInput
): Promise<DeleteTagResult> => {
  if (typeof window === 'undefined' || !('api' in window)) {
    throw new Error('IPC bridge is unavailable');
  }
  await window.api.gitTag({
    repoPath: input.repoPath,
    action: 'delete',
    name: input.name
  });
};

export type UseDeleteTagResult = {
  mutate: UseMutationResult<DeleteTagResult, Error, DeleteTagInput>['mutate'];
  mutateAsync: UseMutationResult<
    DeleteTagResult,
    Error,
    DeleteTagInput
  >['mutateAsync'];
  isPending: boolean;
  isError: boolean;
  error: Error | null;
  reset: () => void;
};

export const useDeleteTag = (): UseDeleteTagResult => {
  const queryClient = useQueryClient();

  const mutation = useMutation<DeleteTagResult, Error, DeleteTagInput>({
    mutationFn: invokeDeleteTag,
    onSuccess: (_data, variables) => {
      const { repoPath } = variables;
      void queryClient.invalidateQueries({
        queryKey: tagListQueryKey(repoPath)
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