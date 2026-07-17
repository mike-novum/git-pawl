import {
  useMutation,
  type UseMutationResult
} from '@tanstack/react-query';

export type CreatePatchInput = {
  repoPath: string;
  range: string;
  destDir?: string;
};

export type CreatePatchResult = { files: string[] };

const invokeCreatePatch = async (
  input: CreatePatchInput
): Promise<CreatePatchResult> => {
  if (typeof window === 'undefined' || !('api' in window)) {
    throw new Error('IPC bridge is unavailable');
  }
  const args: { repoPath: string; range: string; destDir?: string } = {
    repoPath: input.repoPath,
    range: input.range
  };
  if (input.destDir) args.destDir = input.destDir;
  const result = await window.api.gitPatch(
    args as unknown as { repoPath: string; range: string }
  );
  if (result && typeof result === 'object' && 'files' in result) {
    const files = (result as { files: unknown }).files;
    if (Array.isArray(files)) {
      return { files: files.filter((file): file is string => typeof file === 'string') };
    }
  }
  return { files: [] };
};

export type UseCreatePatchResult = {
  mutate: UseMutationResult<CreatePatchResult, Error, CreatePatchInput>['mutate'];
  mutateAsync: UseMutationResult<
    CreatePatchResult,
    Error,
    CreatePatchInput
  >['mutateAsync'];
  isPending: boolean;
  isError: boolean;
  error: Error | null;
  reset: () => void;
};

export const useCreatePatch = (): UseCreatePatchResult => {
  const mutation = useMutation<CreatePatchResult, Error, CreatePatchInput>({
    mutationFn: invokeCreatePatch
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
