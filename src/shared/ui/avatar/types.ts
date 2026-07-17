import type { ComponentPropsWithoutRef } from 'react';

import type { Avatar } from '@base-ui/react/avatar';

export type AvatarSize = 'sm' | 'md' | 'lg';

type AvatarRootProps = ComponentPropsWithoutRef<typeof Avatar.Root>;
type AvatarImageProps = ComponentPropsWithoutRef<typeof Avatar.Image>;
type AvatarFallbackProps = ComponentPropsWithoutRef<typeof Avatar.Fallback>;

export type AvatarRootComponentProps = Omit<AvatarRootProps, 'className'> & {
  size?: AvatarSize;
  className?: string;
};

export type AvatarImageComponentProps = Omit<AvatarImageProps, 'className'> & {
  className?: string;
};

export type AvatarFallbackComponentProps = Omit<AvatarFallbackProps, 'className'> & {
  className?: string;
};
