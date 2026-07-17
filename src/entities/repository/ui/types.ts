import type { FC } from 'react';

import type { Repository } from '../model/types';

export type RepositoryCardProps = {
  repo: Repository;
  onClick?: () => void;
};

export type RepositoryIconProps = {
  iconPath: string | null;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

export type RepositoryStatusDotProps = {
  status: Repository['status'];
  className?: string;
};

export type RepositorySizeTextProps = {
  bytes: number | null;
  className?: string;
};

export type RepositoryBranchBadgeProps = {
  branch: string | null;
  className?: string;
};

export type FC_RepositoryCard = FC<RepositoryCardProps>;
export type FC_RepositoryIcon = FC<RepositoryIconProps>;
export type FC_RepositoryStatusDot = FC<RepositoryStatusDotProps>;
export type FC_RepositorySizeText = FC<RepositorySizeTextProps>;
export type FC_RepositoryBranchBadge = FC<RepositoryBranchBadgeProps>;