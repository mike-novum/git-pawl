import type { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';

export type SheetSide = 'right' | 'left' | 'top' | 'bottom';

type RootProps = ComponentPropsWithoutRef<typeof DialogPrimitive.Root>;
type TriggerProps = ComponentPropsWithoutRef<typeof DialogPrimitive.Trigger>;
type PortalProps = ComponentPropsWithoutRef<typeof DialogPrimitive.Portal>;
type CloseProps = ComponentPropsWithoutRef<typeof DialogPrimitive.Close>;
type TitleProps = ComponentPropsWithoutRef<typeof DialogPrimitive.Title>;
type DescriptionProps = ComponentPropsWithoutRef<typeof DialogPrimitive.Description>;
type PopupProps = ComponentPropsWithoutRef<typeof DialogPrimitive.Popup>;

export type SheetRootProps = Omit<RootProps, 'className'> & {
  className?: string;
};

export type SheetTriggerProps = Omit<TriggerProps, 'className'> & {
  className?: string;
};

export type SheetPortalProps = Omit<PortalProps, 'className'> & {
  className?: string;
};

export type SheetCloseProps = Omit<CloseProps, 'className'> & {
  className?: string;
};

export type SheetContentProps = Omit<PopupProps, 'className' | 'children'> & {
  side?: SheetSide;
  showCloseButton?: boolean;
  className?: string;
  children?: ReactNode;
};

export type SheetHeaderProps = {
  className?: string;
  children?: ReactNode;
};

export type SheetTitleProps = Omit<TitleProps, 'className'> & {
  className?: string;
};

export type SheetDescriptionProps = Omit<DescriptionProps, 'className'> & {
  className?: string;
};

export type SheetFooterProps = {
  className?: string;
  children?: ReactNode;
};
