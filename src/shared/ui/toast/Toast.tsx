import type { ComponentPropsWithoutRef, FC, ReactNode } from 'react';
import { X } from 'lucide-react';

import { Toast as BaseToast } from '@base-ui/react/toast';

import { cn } from '@/shared/lib/theme/cn';
import { Z_POPUP } from '@/shared/lib/theme';

import {
  ToastProvider,
  useToast
} from './ToastProvider';
import type {
  ToastRootProps,
  ToastViewportProps,
  ToastTitleProps,
  ToastDescriptionProps,
  ToastCloseProps,
  ToastActionProps
} from './types';

type ToastManager = {
  toasts: Array<{
    id: string;
    title?: ReactNode;
    description?: ReactNode;
    type?: string;
    timeout?: number;
    priority?: 'low' | 'high';
    transitionStatus?: 'starting' | 'ending';
    updateKey?: number;
    limited?: boolean;
    height?: number;
    onClose?: () => void;
    onRemove?: () => void;
    actionProps?: ComponentPropsWithoutRef<'button'>;
    positionerProps?: object;
    data?: object;
  }>;
  add: (options: object) => string;
  close: (id?: string) => void;
  update: (id: string, options: object) => void;
  promise: <Value>(p: Promise<Value>, options: object) => Promise<Value>;
};

const useToastManager = (): ToastManager => {
  const ns = BaseToast as unknown as { useToastManager: () => ToastManager };
  return ns.useToastManager();
};

export { ToastProvider, useToast };

export const Portal = BaseToast.Portal;

export const Viewport: FC<ToastViewportProps> = ({ className, ...props }) => (
  <BaseToast.Viewport
    className={cn(
      'fixed top-4 right-4 flex w-[360px] max-w-[100vw] flex-col gap-2 outline-none',
      Z_POPUP,
      className
    )}
    {...props}
  />
);

Viewport.displayName = 'Toast.Viewport';

export const Root: FC<ToastRootProps> = ({ className, toast, ...props }) => (
  <BaseToast.Root
    toast={toast}
    className={cn(
      'flex items-start gap-3 rounded-md border border-border bg-gradient-to-br from-card to-background p-4 text-foreground shadow-md',
      'transition-all duration-[var(--duration-base)] ease-[var(--ease-fast)]',
      'data-[starting-style]:translate-x-full data-[starting-style]:opacity-0',
      'data-[ending-style]:translate-x-full data-[ending-style]:opacity-0',
      'data-[type=success]:from-emerald-500/10 data-[type=success]:border-green-600',
      'data-[type=error]:from-red-500/10 data-[type=error]:border-red-600',
      'data-[type=info]:from-primary/10 data-[type=info]:border-primary',
      className
    )}
    {...props}
  />
);

Root.displayName = 'Toast.Root';

export const Content: FC<{ children?: ReactNode; className?: string }> = ({
  children,
  className
}) => <BaseToast.Content className={cn('flex-1', className)}>{children}</BaseToast.Content>;

Content.displayName = 'Toast.Content';

export const Title: FC<ToastTitleProps> = ({ className, ...props }) => (
  <BaseToast.Title className={cn('text-sm font-semibold', className)} {...props} />
);

Title.displayName = 'Toast.Title';

export const Description: FC<ToastDescriptionProps> = ({ className, ...props }) => (
  <BaseToast.Description
    className={cn('mt-1 text-sm text-muted-foreground', className)}
    {...props}
  />
);

Description.displayName = 'Toast.Description';

export const Close: FC<ToastCloseProps> = ({ className, ...props }) => (
  <BaseToast.Close
    aria-label="Close notification"
    className={cn(
      'inline-flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors',
      'hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
      className
    )}
    {...props}
  >
    <X className="size-4" />
  </BaseToast.Close>
);

Close.displayName = 'Toast.Close';

export const Action: FC<ToastActionProps> = ({ className, ...props }) => (
  <BaseToast.Action
    className={cn(
      'inline-flex h-8 items-center justify-center rounded-sm px-3 text-sm font-medium transition-colors',
      'bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
      className
    )}
    {...props}
  />
);

Action.displayName = 'Toast.Action';

export const ToastList: FC<{ className?: string }> = ({ className }) => {
  const manager = useToastManager();

  if (manager.toasts.length === 0) {
    return null;
  }

  return (
    <>
      {manager.toasts.map((toast) => (
        <Root key={toast.id} toast={toast} className={className}>
          <Content>
            {toast.title && <Title>{toast.title}</Title>}
            {toast.description && <Description>{toast.description}</Description>}
          </Content>
          <Close />
        </Root>
      ))}
    </>
  );
};

ToastList.displayName = 'Toast.List';

export const Toast = {
  Provider: ToastProvider,
  Viewport,
  Portal,
  Root,
  Content,
  Title,
  Description,
  Close,
  Action,
  List: ToastList
};
