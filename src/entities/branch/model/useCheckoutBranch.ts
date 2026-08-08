import {
  useMutation,
  useQueryClient,
  type UseMutationResult
} from '@tanstack/react-query';

import { gitCheckout } from '@/shared/api';
import { useToast } from '@/shared/ui';

export type CheckoutBranchInput = {
  repoPath: string;
  ref: string;
};

export type CheckoutBranchResult = void;

const CHECKOUT_QUERY_KEYS = [
  'current-branch',
  'branch-list',
  'git-log',
  'branch-mainlines'
] as const;

const invokeCheckout = async (
  input: CheckoutBranchInput
): Promise<CheckoutBranchResult> => {
  await gitCheckout({
    repoPath: input.repoPath,
    ref: input.ref,
    create: false
  });
};

export type UseCheckoutBranchResult = UseMutationResult<
  CheckoutBranchResult,
  Error,
  CheckoutBranchInput
>;

export const useCheckoutBranch = (): UseCheckoutBranchResult => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation<CheckoutBranchResult, Error, CheckoutBranchInput>({
    mutationFn: invokeCheckout,
    onSuccess: (_data, variables) => {
      const { repoPath, ref } = variables;
      for (const key of CHECKOUT_QUERY_KEYS) {
        void queryClient.invalidateQueries({ queryKey: [key, repoPath] });
      }
      toast.success({
        title: `Ветка ${ref} переключена`
      });
    },
    onError: (err, variables) => {
      toast.error({
        title: `Не удалось переключить ветку ${variables.ref}`,
        description: err.message
      });
    }
  });
};