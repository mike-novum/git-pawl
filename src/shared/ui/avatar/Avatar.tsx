import { Avatar as BaseAvatar } from '@base-ui/react/avatar';
import type { FC } from 'react';

import { cn } from '@/shared/lib/theme';

import type {
  AvatarFallbackComponentProps,
  AvatarImageComponentProps,
  AvatarRootComponentProps,
  AvatarSize
} from './types';

const SIZE_CLASSES: Record<AvatarSize, string> = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-base'
};

const AvatarRoot: FC<AvatarRootComponentProps> = ({
  size = 'md',
  className,
  ...props
}) => (
  <BaseAvatar.Root
    className={cn(
      'relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted',
      SIZE_CLASSES[size],
      className
    )}
    {...props}
  />
);

const AvatarImage: FC<AvatarImageComponentProps> = ({ className, ...props }) => (
  <BaseAvatar.Image
    className={cn('h-full w-full object-cover', className)}
    {...props}
  />
);

const AvatarFallback: FC<AvatarFallbackComponentProps> = ({
  className,
  ...props
}) => (
  <BaseAvatar.Fallback
    className={cn(
      'text-muted-foreground flex h-full w-full items-center justify-center rounded-full font-medium',
      className
    )}
    {...props}
  />
);

export { AvatarRoot, AvatarImage, AvatarFallback };
