import type { ComponentProps, ReactNode } from 'react';

import type { Dialog } from '@base-ui/react/dialog';

export type DialogRootProps = ComponentProps<typeof Dialog.Root>;
export type DialogTriggerProps = ComponentProps<typeof Dialog.Trigger>;
export type DialogPortalProps = ComponentProps<typeof Dialog.Portal>;
export type DialogPopupProps = ComponentProps<typeof Dialog.Popup>;
export type DialogBackdropProps = ComponentProps<typeof Dialog.Backdrop>;
export type DialogTitleProps = ComponentProps<typeof Dialog.Title>;
export type DialogDescriptionProps = ComponentProps<typeof Dialog.Description>;
export type DialogCloseProps = ComponentProps<typeof Dialog.Close>;

export type DialogContentProps = {
  title: ReactNode;
  description?: ReactNode;
  className?: string;
  children?: ReactNode;
};
