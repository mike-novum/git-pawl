import type { ComponentProps, ReactNode } from 'react';

import type { Toast } from '@base-ui/react/toast';

export type ToastProviderProps = ComponentProps<typeof Toast.Provider>;
export type ToastViewportProps = ComponentProps<typeof Toast.Viewport>;
export type ToastRootProps = ComponentProps<typeof Toast.Root>;
export type ToastContentProps = ComponentProps<typeof Toast.Content>;
export type ToastTitleProps = ComponentProps<typeof Toast.Title>;
export type ToastDescriptionProps = ComponentProps<typeof Toast.Description>;
export type ToastCloseProps = ComponentProps<typeof Toast.Close>;
export type ToastActionProps = ComponentProps<typeof Toast.Action>;
export type ToastPortalProps = ComponentProps<typeof Toast.Portal>;

export type ToastInput = {
  title?: ReactNode;
  description?: ReactNode;
  type?: 'default' | 'success' | 'error' | 'info';
  timeout?: number;
};

export type ToastApi = {
  show: (input: ToastInput) => string;
  success: (input: Omit<ToastInput, 'type'>) => string;
  error: (input: Omit<ToastInput, 'type'>) => string;
  info: (input: Omit<ToastInput, 'type'>) => string;
  close: (id?: string) => void;
};
