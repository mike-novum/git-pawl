import { useMemo, useState } from 'react';
import type { FC } from 'react';

import { useBranches, useCurrentBranch } from '@/entities/branch';
import { BranchBadge, BranchSwitcher } from '@/entities/branch/ui';
import { useStashList } from '@/entities/stash';
import { StashRow } from '@/entities/stash/ui';
import { useTags } from '@/entities/tag';
import { TagBadge } from '@/entities/tag/ui';
import {
  Empty,
  ScrollArea,
  ScrollAreaViewport,
  Tabs
} from '@/shared/ui';
import { cn } from '@/shared/lib/theme';

import type { BranchTabsSectionProps, RepositoryTabId } from './types';

const TAB_IDS: readonly RepositoryTabId[] = ['branches', 'tags', 'stash'] as const;

export const BranchTabsSection: FC<BranchTabsSectionProps> = ({
  repoPath,
  className
}) => {
  const [tabId, setTabId] = useState<RepositoryTabId>('branches');

  const branchesQuery = useBranches(repoPath);
  const currentBranchQuery = useCurrentBranch(repoPath);
  const tagsQuery = useTags(repoPath);
  const stashQuery = useStashList(repoPath);

  const branches = branchesQuery.data ?? [];
  const tags = tagsQuery.data ?? [];
  const stash = stashQuery.data ?? [];

  const currentBranchName = currentBranchQuery.data?.name ?? null;
  const isDetached = currentBranchQuery.data?.detached ?? false;

  const branchCount = useMemo(
    () => branches.length,
    [branches.length]
  );

  return (
    <section
      aria-label="Refs"
      className={cn('flex h-full min-h-0 flex-col', className)}
    >
      <Tabs.Root
        value={tabId}
        onValueChange={(value) => {
          if (TAB_IDS.includes(value as RepositoryTabId)) {
            setTabId(value as RepositoryTabId);
          }
        }}
      >
        <Tabs.List className="w-full">
          <Tabs.Trigger value="branches">Branches ({branchCount})</Tabs.Trigger>
          <Tabs.Trigger value="tags">Tags ({tags.length})</Tabs.Trigger>
          <Tabs.Trigger value="stash">Stash ({stash.length})</Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="branches" className="flex-1 overflow-hidden">
          <BranchesTab
            branches={branches}
            currentBranch={currentBranchName}
            isLoading={branchesQuery.isLoading}
            isError={branchesQuery.isError}
          />
          {isDetached && currentBranchName ? (
            <p className="text-muted-foreground mt-2 px-1 text-xs">
              HEAD is detached at <span className="font-mono">{currentBranchName}</span>.
            </p>
          ) : null}
        </Tabs.Content>

        <Tabs.Content value="tags" className="flex-1 overflow-hidden">
          <TagsTab
            tags={tags}
            isLoading={tagsQuery.isLoading}
            isError={tagsQuery.isError}
          />
        </Tabs.Content>

        <Tabs.Content value="stash" className="flex-1 overflow-hidden">
          <StashTab
            stash={stash}
            isLoading={stashQuery.isLoading}
            isError={stashQuery.isError}
          />
        </Tabs.Content>
      </Tabs.Root>
    </section>
  );
};

BranchTabsSection.displayName = 'BranchTabsSection';

type BranchesTabProps = {
  branches: import('@/entities/branch').Branch[];
  currentBranch: string | null;
  isLoading: boolean;
  isError: boolean;
};

const BranchesTab: FC<BranchesTabProps> = ({
  branches,
  currentBranch,
  isLoading,
  isError
}) => {
  if (isLoading) {
    return (
      <div className="text-muted-foreground p-4 text-sm">Loading branches...</div>
    );
  }

  if (isError) {
    return (
      <Empty
        title="Failed to load branches"
        description="Check the repository path and try again."
        className="m-2"
      />
    );
  }

  return (
    <ScrollArea className="h-full min-h-0">
      <ScrollAreaViewport className="h-full">
        <div className="flex flex-col gap-2 p-2">
          {branches.length === 0 ? (
            <Empty
              title="No branches"
              description="This repository has no branches yet."
              className="m-2"
            />
          ) : (
            <>
              <BranchSwitcher branches={branches} current={currentBranch} />
              <div className="flex flex-wrap gap-1.5 px-1">
                {branches.map((branch) => (
                  <BranchBadge
                    key={branch.name}
                    name={branch.name}
                    current={branch.name === currentBranch}
                    {...(branch.upstream ? { upstream: branch.upstream } : {})}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </ScrollAreaViewport>
    </ScrollArea>
  );
};

BranchesTab.displayName = 'BranchesTab';

type TagsTabProps = {
  tags: import('@/entities/tag').Tag[];
  isLoading: boolean;
  isError: boolean;
};

const TagsTab: FC<TagsTabProps> = ({ tags, isLoading, isError }) => {
  if (isLoading) {
    return <div className="text-muted-foreground p-4 text-sm">Loading tags...</div>;
  }

  if (isError) {
    return (
      <Empty
        title="Failed to load tags"
        description="Check the repository path and try again."
        className="m-2"
      />
    );
  }

  if (tags.length === 0) {
    return (
      <Empty
        title="No tags"
        description="This repository has no tags yet."
        className="m-2"
      />
    );
  }

  return (
    <ScrollArea className="h-full min-h-0">
      <ScrollAreaViewport className="h-full">
        <div className="flex flex-wrap gap-1.5 p-3">
          {tags.map((tag) => (
            <TagBadge key={tag.name} tag={tag} />
          ))}
        </div>
      </ScrollAreaViewport>
    </ScrollArea>
  );
};

TagsTab.displayName = 'TagsTab';

type StashTabProps = {
  stash: import('@/entities/stash').StashEntry[];
  isLoading: boolean;
  isError: boolean;
};

const StashTab: FC<StashTabProps> = ({ stash, isLoading, isError }) => {
  if (isLoading) {
    return <div className="text-muted-foreground p-4 text-sm">Loading stash...</div>;
  }

  if (isError) {
    return (
      <Empty
        title="Failed to load stash"
        description="Check the repository path and try again."
        className="m-2"
      />
    );
  }

  if (stash.length === 0) {
    return (
      <Empty
        title="No stash entries"
        description="Use stash to save uncommitted changes for later."
        className="m-2"
      />
    );
  }

  return (
    <ScrollArea className="h-full min-h-0">
      <ScrollAreaViewport className="h-full">
        <ul className="flex flex-col gap-2 p-2" role="list">
          {stash.map((entry) => (
            <li key={entry.ref}>
              <StashRow entry={entry} />
            </li>
          ))}
        </ul>
      </ScrollAreaViewport>
    </ScrollArea>
  );
};

StashTab.displayName = 'StashTab';
