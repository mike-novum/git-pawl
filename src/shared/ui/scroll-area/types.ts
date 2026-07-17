import type { ScrollArea as ScrollAreaPrimitive } from '@base-ui/react/scroll-area';
import type { ComponentPropsWithoutRef } from 'react';

type RootProps = ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>;
type ViewportProps = ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Viewport>;
type ScrollbarProps = ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Scrollbar>;
type ThumbProps = ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Thumb>;

export type ScrollAreaRootProps = Omit<RootProps, 'className'> & {
  className?: string;
};

export type ScrollAreaViewportProps = Omit<ViewportProps, 'className'> & {
  className?: string;
};

export type ScrollAreaScrollbarProps = Omit<ScrollbarProps, 'className'> & {
  className?: string;
};

export type ScrollAreaThumbProps = Omit<ThumbProps, 'className'> & {
  className?: string;
};
