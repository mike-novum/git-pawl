import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import type { FC } from 'react';

import { cn, Z_POPUP } from '@/shared/lib/theme';

import type {
  SheetCloseProps,
  SheetContentProps,
  SheetDescriptionProps,
  SheetFooterProps,
  SheetHeaderProps,
  SheetPortalProps,
  SheetRootProps,
  SheetSide,
  SheetTitleProps,
  SheetTriggerProps
} from './types';

const SIDE_STYLES: Record<SheetSide, string> = {
  right: 'inset-y-0 right-0 h-full w-3/4 max-w-sm border-l',
  left: 'inset-y-0 left-0 h-full w-3/4 max-w-sm border-r',
  top: 'inset-x-0 top-0 w-full h-1/3 max-h-sm border-b',
  bottom: 'inset-x-0 bottom-0 w-full h-1/3 max-h-sm border-t'
};

const SIDE_TRANSITIONS: Record<SheetSide, string> = {
  right: 'data-[starting-style]:translate-x-full data-[ending-style]:translate-x-full',
  left: 'data-[starting-style]:-translate-x-full data-[ending-style]:-translate-x-full',
  top: 'data-[starting-style]:-translate-y-full data-[ending-style]:-translate-y-full',
  bottom: 'data-[starting-style]:translate-y-full data-[ending-style]:translate-y-full'
};

const SheetRoot: FC<SheetRootProps> = (props) => <BaseDialog.Root {...props} />;

const SheetTrigger: FC<SheetTriggerProps> = ({ className, ...props }) => (
  <BaseDialog.Trigger
    className={cn(
      'focus-visible:ring-ring focus:outline-none focus-visible:ring-2',
      className
    )}
    {...props}
  />
);

const SheetPortal: FC<SheetPortalProps> = (props) => <BaseDialog.Portal {...props} />;

const SheetClose: FC<SheetCloseProps> = ({ className, ...props }) => (
  <BaseDialog.Close
    className={cn(
      'focus-visible:ring-ring focus:outline-none focus-visible:ring-2',
      className
    )}
    {...props}
  />
);

const SheetBackdrop: FC<{ className?: string }> = ({ className }) => (
  <BaseDialog.Backdrop
    className={cn(
      'fixed inset-0 bg-black/60 backdrop-blur-sm',
      Z_POPUP,
      'data-[starting-style]:opacity-0 data-[ending-style]:opacity-0',
      'transition-opacity duration-base',
      className
    )}
  />
);

const SheetContent: FC<SheetContentProps> = ({
  side = 'right',
  showCloseButton = true,
  className,
  children,
  ...props
}) => (
  <BaseDialog.Popup
    className={cn(
      'bg-background text-foreground fixed shadow-lg gap-4 p-6 flex flex-col',
      Z_POPUP,
      'transition-transform duration-base ease-fast',
      SIDE_STYLES[side],
      SIDE_TRANSITIONS[side],
      className
    )}
    {...props}
  >
    {children}
    {showCloseButton ? (
      <SheetClose
        aria-label="Close"
        className="text-muted-foreground hover:text-foreground absolute top-4 right-4 rounded-sm opacity-70 transition-opacity hover:opacity-100"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      </SheetClose>
    ) : null}
  </BaseDialog.Popup>
);

const SheetHeader: FC<SheetHeaderProps> = ({ className, children }) => (
  <div className={cn('flex flex-col gap-2 text-left', className)}>{children}</div>
);

const SheetTitle: FC<SheetTitleProps> = ({ className, ...props }) => (
  <BaseDialog.Title
    className={cn('text-foreground text-lg font-semibold', className)}
    {...props}
  />
);

const SheetDescription: FC<SheetDescriptionProps> = ({ className, ...props }) => (
  <BaseDialog.Description
    className={cn('text-muted-foreground text-sm', className)}
    {...props}
  />
);

const SheetFooter: FC<SheetFooterProps> = ({ className, children }) => (
  <div
    className={cn(
      'flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-2',
      className
    )}
  >
    {children}
  </div>
);

export {
  SheetRoot,
  SheetTrigger,
  SheetPortal,
  SheetClose,
  SheetBackdrop,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter
};
