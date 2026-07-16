import { useMemo } from 'react';
import type { FC } from 'react';

import { Toast as BaseToast } from '@base-ui/react/toast';

import type { ToastApi, ToastInput, ToastProviderProps } from './types';

type ToastManager = {
  toasts: object[];
  add: (options: ToastInput) => string;
  close: (id?: string) => void;
  update: (id: string, options: object) => void;
  promise: <Value>(p: Promise<Value>, options: object) => Promise<Value>;
};

const useToastManager = (): ToastManager => {
  const namespace = BaseToast as unknown as { useToastManager: () => ToastManager };
  return namespace.useToastManager();
};

export const useToast = (): ToastApi => {
  const manager = useToastManager();

  return useMemo<ToastApi>(
    () => ({
      show: (input: ToastInput) => manager.add(input),
      success: (input: Omit<ToastInput, 'type'>) => manager.add({ ...input, type: 'success' }),
      error: (input: Omit<ToastInput, 'type'>) => manager.add({ ...input, type: 'error' }),
      info: (input: Omit<ToastInput, 'type'>) => manager.add({ ...input, type: 'info' }),
      close: (id?: string) => manager.close(id)
    }),
    [manager]
  );
};

export const ToastProvider: FC<ToastProviderProps> = (props) => <BaseToast.Provider {...props} />;

ToastProvider.displayName = 'ToastProvider';
