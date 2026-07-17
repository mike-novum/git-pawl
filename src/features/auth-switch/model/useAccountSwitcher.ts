import { useMemo } from 'react';

import { useAppStore } from '@/app/store';
import {
  useAccountList,
  useRemoveAccount,
  useSetActiveAccount,
  type Account
} from '@/entities/account';

export type AccountSwitcherState = {
  accounts: Account[];
  activeAccountId: string | null;
  active: Account | undefined;
  isLoading: boolean;
  isSwitching: boolean;
  isRemoving: boolean;
  setActive: (id: string) => void;
  remove: (id: string) => void;
};

export const useAccountSwitcher = (): AccountSwitcherState => {
  const { data, isLoading } = useAccountList();
  const activeAccountId = useAppStore((state) => state.activeAccountId);
  const setActiveMutation = useSetActiveAccount();
  const removeMutation = useRemoveAccount();

  const accounts = useMemo<Account[]>(() => data ?? [], [data]);
  const active = useMemo<Account | undefined>(
    () => accounts.find((account) => account.id === activeAccountId),
    [accounts, activeAccountId]
  );

  return {
    accounts,
    activeAccountId,
    active,
    isLoading,
    isSwitching: setActiveMutation.isPending,
    isRemoving: removeMutation.isPending,
    setActive: (id) => {
      setActiveMutation.mutate(id);
    },
    remove: (id) => {
      removeMutation.mutate(id);
    }
  };
};