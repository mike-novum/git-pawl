import {
  useMutation,
  useQueryClient,
  type UseMutationResult
} from '@tanstack/react-query';

import { gitCheckout } from '@/shared/api';

export type CreateBranchInput = {
  repoPath: string;
  ref: string;
};

export type CreateBranchResult = void;

const CREATE_QUERY_KEYS = [
  'branch-list',
  'branch-mainlines',
  'git-log',
  'current-branch'
] as const;

const invokeCreate = async (input: CreateBranchInput): Promise<CreateBranchResult> => {
  await gitCheckout({
    repoPath: input.repoPath,
    ref: input.ref,
    create: true
  });
};

export type UseCreateBranchResult = UseMutationResult<
  CreateBranchResult,
  Error,
  CreateBranchInput
>;

export const useCreateBranch = (): UseCreateBranchResult => {
  const queryClient = useQueryClient();

  return useMutation<CreateBranchResult, Error, CreateBranchInput>({
    mutationFn: invokeCreate,
    onSuccess: (_data, variables) => {
      const { repoPath } = variables;
      for (const key of CREATE_QUERY_KEYS) {
        void queryClient.invalidateQueries({ queryKey: [key, repoPath] });
      }
    }
  });
};
