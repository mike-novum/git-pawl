import { ChevronDown, GitBranch, Plus, Tag } from 'lucide-react';
import { useState, type FC, type ReactNode } from 'react';

import { useBranches } from '@/entities/branch';
import { useTags } from '@/entities/tag';
import { useStashList } from '@/entities/stash';

import type { RepoTreeProps } from '../types';

const Section: FC<{
  title: string;
  count: number;
  defaultOpen?: boolean;
  children: ReactNode;
}> = ({ title, count, defaultOpen = true, children }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="text-foreground hover:bg-surface-elevated flex items-center gap-1.5 rounded px-2 py-1 text-xs font-semibold transition-colors"
      >
        <ChevronDown
          aria-hidden="true"
          className={`size-3 transition-transform ${open ? '' : '-rotate-90'}`}
        />
        {title}
        <span className="text-muted-foreground">({count})</span>
      </button>
      {open ? <div className="flex flex-col gap-0.5 pl-3">{children}</div> : null}
    </div>
  );
};

export const RepoTree: FC<RepoTreeProps> = ({ repoPath }) => {
  const { data: branches = [] } = useBranches(repoPath);
  const { data: tags = [] } = useTags(repoPath);
  const { data: stash = [] } = useStashList(repoPath);

  return (
    <aside className="bg-surface border-border flex h-full w-60 shrink-0 flex-col gap-3 overflow-auto border-r p-3">
      <Section title="Branches" count={branches.length}>
        {branches.map((b) => (
          <button
            type="button"
            key={b.name}
            className={`hover:bg-surface-elevated flex items-center gap-2 rounded px-2 py-1 text-left text-xs ${
              b.current ? 'text-primary font-medium' : 'text-foreground'
            }`}
          >
            <GitBranch aria-hidden="true" className="size-3 shrink-0" />
            <span className="truncate">{b.name}</span>
            {b.upstream?.ahead && b.upstream.ahead > 0 ? (
              <span
                aria-label="unpushed commits"
                className="bg-warning ml-auto size-1.5 rounded-full"
              />
            ) : null}
          </button>
        ))}
        <button
          type="button"
          className="text-muted-foreground hover:text-primary flex items-center gap-1 px-2 py-1 text-xs transition-colors"
        >
          <Plus aria-hidden="true" className="size-3" /> New branch
        </button>
      </Section>

      <Section title="Tags" count={tags.length}>
        {tags.map((t) => (
          <button
            type="button"
            key={t.name}
            className="text-foreground hover:bg-surface-elevated flex items-center gap-2 rounded px-2 py-1 text-left text-xs"
          >
            <Tag aria-hidden="true" className="text-muted-foreground size-3 shrink-0" />
            <span className="truncate">{t.name}</span>
          </button>
        ))}
      </Section>

      <Section title="Stash" count={stash.length} defaultOpen={false}>
        {stash.map((s) => (
          <div
            key={s.ref}
            className="text-foreground hover:bg-surface-elevated truncate rounded px-2 py-1 text-xs"
          >
            {s.message ?? s.ref}
          </div>
        ))}
      </Section>
    </aside>
  );
};

RepoTree.displayName = 'RepoTree';
