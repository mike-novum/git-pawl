import { ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { useState, type FC } from 'react';

import type { RepoGroupProps } from '../types';
import { RepoCard } from './RepoCard';

export const RepoGroup: FC<RepoGroupProps> = ({
  name,
  repos,
  sizeBytesByRepo,
  onRepoClick
}) => {
  const [collapsed, setCollapsed] = useState(false);

  const totalSize = repos.reduce(
    (sum, r) => sum + (sizeBytesByRepo.get(r.id) ?? 0),
    0
  );

  return (
    <section className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        className="text-foreground hover:text-primary flex items-center gap-2 text-sm font-semibold transition-colors"
      >
        {collapsed ? (
          <ChevronRight aria-hidden="true" className="size-4" />
        ) : (
          <ChevronDown aria-hidden="true" className="size-4" />
        )}
        {name}
        <span className="text-muted-foreground font-normal">
          {repos.length} {repos.length === 1 ? 'repo' : 'repos'} ·{' '}
          {totalSize > 0 ? `${(totalSize / (1024 * 1024)).toFixed(0)} MB` : '—'}
        </span>
      </button>
      {!collapsed ? (
        <div
          className="grid gap-3"
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}
        >
          {repos.map((repo) => (
            <RepoCard
              key={repo.id}
              repo={repo}
              sizeBytes={sizeBytesByRepo.get(repo.id) ?? null}
              onClick={() => onRepoClick(repo)}
            />
          ))}
          <button
            type="button"
            className="border-border hover:border-primary hover:bg-primary/5 flex h-32 items-center justify-center gap-2 rounded-lg border border-dashed text-sm transition-colors"
          >
            <Plus aria-hidden="true" className="text-primary size-4" />
            <span className="text-muted-foreground">Add to {name}</span>
          </button>
        </div>
      ) : null}
    </section>
  );
};

RepoGroup.displayName = 'RepoGroup';
