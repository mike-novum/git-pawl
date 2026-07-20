import { useState } from 'react';
import type { FC } from 'react';

import { cn, toFileUrl } from '@/shared/lib';

import type { RepositoryIconProps } from './types';

const SIZE_CLASSES: Record<NonNullable<RepositoryIconProps['size']>, string> = {
  sm: 'h-8 w-8 text-base',
  md: 'h-10 w-10 text-lg',
  lg: 'h-14 w-14 text-2xl'
};

export const RepositoryIcon: FC<RepositoryIconProps> = ({
  iconPath,
  name,
  size = 'md',
  className
}) => {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(iconPath) && !failed;
  const initial = name.trim().charAt(0).toUpperCase() || 'R';

  return (
    <div
      className={cn(
        'relative flex shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted text-muted-foreground',
        SIZE_CLASSES[size],
        className
      )}
    >
      {showImage && iconPath ? (
        <img
          src={toFileUrl(iconPath)}
          alt={`${name} icon`}
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <span aria-hidden="true">{initial}</span>
      )}
    </div>
  );
};