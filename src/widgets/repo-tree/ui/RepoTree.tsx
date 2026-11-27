import { ChevronDown, GitBranch, Plus, Tag } from 'lucide-react';
import type { ChangeEvent, FC, ReactNode } from 'react';
import { useMemo, useState } from 'react';

import { useBranches } from '@/entities/branch';
import { useTags } from '@/entities/tag';
import { useStashList } from '@/entities/stash';
import { CreateBranchDialog } from '@/features/create-branch';
import { cn } from '@/shared/lib/theme';
import { Input } from '@/shared/ui';

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

export const RepoTree: FC<RepoTreeProps> = ({
  repoPath,
  onSwitchBranch,
  className
}) => {
  const { data: branches = [] } = useBranches(repoPath);
  const { data: tags = [] } = useTags(repoPath);
  const { data: stash = [] } = useStashList(repoPath);

  const [createOpen, setCreateOpen] = useState(false);
  const [branchFilter, setBranchFilter] = useState('');

  const filteredBranches = useMemo(() => {
    const query = branchFilter.trim().toLowerCase();
    if (!query) return branches;
    return branches.filter((b) => b.name.toLowerCase().includes(query));
  }, [branches, branchFilter]);

  const handleSwitchBranch = (branchName: string): void => {
    if (onSwitchBranch) {
      onSwitchBranch(branchName);
    } else {
      console.warn(
        'RepoTree: onSwitchBranch callback is not provided, cannot switch to',
        branchName
      );
    }
  };

  const handleBranchFilterChange = (
    e: ChangeEvent<HTMLInputElement>
  ): void => {
    setBranchFilter(e.target.value);
  };

  return (
    <aside
      className={cn(
        'bg-surface flex h-full w-full flex-col gap-3 overflow-auto p-3',
        className
      )}
    >
      <Section title="Branches" count={branches.length}>
        <div className="mb-1">
          <Input
            size="sm"
            placeholder="Filter branches…"
            value={branchFilter}
            onChange={handleBranchFilterChange}
            className="h-7 text-xs"
            aria-label="Filter branches"
          />
        </div>
        {filteredBranches.length === 0 ? (
          <div className="text-muted-foreground px-2 py-1.5 text-xs italic">
            No branches found
          </div>
        ) : (
          filteredBranches.map((b) => (
            <button
              type="button"
              key={b.name}
              disabled={b.current}
              onClick={() => handleSwitchBranch(b.name)}
              className={`hover:bg-surface-elevated flex items-center gap-2 rounded px-2 py-1 text-left text-xs disabled:cursor-not-allowed disabled:opacity-60 ${
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
          ))
        )}
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
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

      <CreateBranchDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        repoPath={repoPath}
      />
    </aside>
  );
};

RepoTree.displayName = 'RepoTree';
