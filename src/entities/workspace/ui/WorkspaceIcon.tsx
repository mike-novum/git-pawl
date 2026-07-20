import { Folder } from 'lucide-react';
import type { FC } from 'react';
import { useState } from 'react';

import { cn, useImageDataUrl } from '@/shared/lib';

import type { WorkspaceIconProps, WorkspaceIconSize } from './types';

const SIZE_CLASSES: Record<WorkspaceIconSize, string> = {
  sm: 'size-8',
  md: 'size-10',
  lg: 'size-20'
};

const FALLBACK_ICON_SIZE: Record<WorkspaceIconSize, string> = {
  sm: 'size-4',
  md: 'size-5',
  lg: 'size-8'
};

const BASE_CLASSES =
  'bg-surface-elevated text-primary flex items-center justify-center overflow-hidden rounded-lg';

export const WorkspaceIcon: FC<WorkspaceIconProps> = ({
  workspace,
  iconPath,
  size = 'md',
  className,
  alt,
  children
}) => {
  const [failedPaths, setFailedPaths] = useState<ReadonlySet<string>>(
    new Set()
  );
  const hasError = iconPath !== null && failedPaths.has(iconPath);
  const { data: src } = useImageDataUrl(
    iconPath && !hasError ? iconPath : null
  );
  const showFallback = !iconPath || hasError || !src;

  return (
    <div className={cn(BASE_CLASSES, SIZE_CLASSES[size], className)}>
      {showFallback ? (
        children ?? (
          <Folder aria-hidden="true" className={FALLBACK_ICON_SIZE[size]} />
        )
      ) : (
        <img
          src={src}
          alt={alt ?? `${workspace.name} icon`}
          className="h-full w-full object-cover"
          onError={() => {
            if (!iconPath) return;

            setFailedPaths((currentPaths) =>
              new Set(currentPaths).add(iconPath)
            );
          }}
        />
      )}
    </div>
  );
};

WorkspaceIcon.displayName = 'WorkspaceIcon';