import type { FC } from 'react';

import { RepositoryCard } from '@/entities/repository';
import type { Repository } from '@/entities/repository';
import { cn } from '@/shared/lib/theme';

import type { RepoGridProps } from '../types';

export const RepoGrid: FC<RepoGridProps> = ({ repos, onRepoClick, className }) => {
  return (
    <div
      className={cn(
        'grid gap-3',
        'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
        className
      )}
    >
      {repos.map((repo) => (
        <RepositoryCard
          key={repo.id}
          repo={repo}
          onClick={() => onRepoClick(repo)}
        />
      ))}
    </div>
  );
};

RepoGrid.displayName = 'RepoGrid';

export type RepoGridClickHandler = (repo: Repository) => void;