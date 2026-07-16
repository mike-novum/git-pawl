import { X } from 'lucide-react';
import type { FC, ReactNode } from 'react';

import { Dialog as BaseDialog } from '@base-ui/react/dialog';

import { cn } from '@/shared/lib/theme/cn';

import type { DialogContentProps } from './types';

export const Root = BaseDialog.Root;
export const Trigger = BaseDialog.Trigger;
export const Portal = BaseDialog.Portal;
export const Title = BaseDialog.Title;
export const Description = BaseDialog.Description;
export const Close = BaseDialog.Close;

export const Backdrop: FC<{ className?: string }> = ({ className }) => (
  <BaseDialog.Backdrop
    className={cn(
      'fixed inset-0 z-50 bg-black/60 backdrop-blur-sm',
      'transition-opacity duration-[var(--duration-fast)] ease-[var(--ease-fast)]',
      'data-[starting-style]:opacity-0 data-[ending-style]:opacity-0',
      className
    )}
  />
);

Backdrop.displayName = 'Dialog.Backdrop';

export const Popup: FC<{ className?: string; children?: ReactNode }> = ({
  className,
  children
}) => (
  <BaseDialog.Popup
    className={cn(
      'fixed top-1/2 left-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 rounded-lg border border-border bg-background p-6 shadow-lg',
      'transition-all duration-[var(--duration-base)] ease-[var(--ease-fast)]',
      'data-[starting-style]:scale-95 data-[starting-style]:opacity-0',
      'data-[ending-style]:scale-95 data-[ending-style]:opacity-0',
      className
    )}
  >
    {children}
  </BaseDialog.Popup>
);

Popup.displayName = 'Dialog.Popup';

export const Header: FC<{
  title: ReactNode;
  description?: ReactNode;
  className?: string;
}> = ({ title, description, className }) => (
  <div className={cn('flex flex-col gap-1.5 text-left', className)}>
    <BaseDialog.Title className="text-lg font-semibold text-foreground">{title}</BaseDialog.Title>
    {description && (
      <BaseDialog.Description className="text-sm text-muted-foreground">
        {description}
      </BaseDialog.Description>
    )}
  </div>
);

Header.displayName = 'Dialog.Header';

export const Content: FC<DialogContentProps> = ({
  title,
  description,
  className,
  children
}) => (
  <BaseDialog.Popup
    className={cn(
      'fixed top-1/2 left-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 rounded-lg border border-border bg-background p-6 shadow-lg',
      'transition-all duration-[var(--duration-base)] ease-[var(--ease-fast)]',
      'data-[starting-style]:scale-95 data-[starting-style]:opacity-0',
      'data-[ending-style]:scale-95 data-[ending-style]:opacity-0',
      className
    )}
  >
    <Header title={title} description={description} />
    {children && <div className="text-sm text-foreground">{children}</div>}
    <BaseDialog.Close
      className={cn(
        'absolute top-3 right-3 inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors',
        'hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'
      )}
      aria-label="Close dialog"
    >
      <X className="size-4" />
    </BaseDialog.Close>
  </BaseDialog.Popup>
);

Content.displayName = 'Dialog.Content';

export const Dialog = {
  Root,
  Trigger,
  Portal,
  Backdrop,
  Popup,
  Title,
  Description,
  Close,
  Header,
  Content
};
