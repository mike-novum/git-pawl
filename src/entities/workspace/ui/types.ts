import type { ReactNode } from 'react';

import type { Workspace } from '../model/types';

export type WorkspaceIconSize = 'sm' | 'md' | 'lg';

export type WorkspaceIconProps = {
  workspace: Workspace;
  iconPath: string | null;
  size?: WorkspaceIconSize;
  className?: string;
  alt?: string;
  children?: ReactNode;
};
