import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Branch } from '@/entities/branch';
import type { StashEntry } from '@/entities/stash';
import type { Tag } from '@/entities/tag';

vi.mock('@/entities/branch', () => ({
  useBranches: vi.fn(),
  useCheckoutBranch: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false
  }))
}));

vi.mock('@/entities/tag', () => ({
  useTags: vi.fn()
}));

vi.mock('@/entities/stash', () => ({
  useStashList: vi.fn()
}));

vi.mock('@/features/create-branch', () => ({
  CreateBranchDialog: () => null
}));

import { useBranches } from '@/entities/branch';
import { useStashList } from '@/entities/stash';
import { useTags } from '@/entities/tag';

import { RepoTree } from './RepoTree';

const branchesMock = useBranches as ReturnType<typeof vi.fn>;
const tagsMock = useTags as ReturnType<typeof vi.fn>;
const stashMock = useStashList as ReturnType<typeof vi.fn>;

const BRANCHES: Branch[] = [
  {
    name: 'main',
    target: 'aaaaaaa',
    current: true,
    commits: ['aaaaaaa'],
    upstream: undefined
  },
  {
    name: 'feature/auth',
    target: 'bbbbbbb',
    current: false,
    commits: ['bbbbbbb'],
    upstream: undefined
  },
  {
    name: 'fix/bug-42',
    target: 'ccccccc',
    current: false,
    commits: ['ccccccc'],
    upstream: undefined
  }
];

const TAGS: Tag[] = [];
const STASH: StashEntry[] = [];

const createQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false
      }
    }
  });

const renderTree = (
  onSwitchBranch?: (branchName: string) => void
): ReturnType<typeof render> => {
  const queryClient = createQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <RepoTree
        repoPath="/tmp/repo"
        selectedCommit={null}
        onSelectCommit={vi.fn()}
        {...(onSwitchBranch ? { onSwitchBranch } : {})}
      />
    </QueryClientProvider>
  );
};

describe('RepoTree', () => {
  beforeEach(() => {
    branchesMock.mockReturnValue({ data: BRANCHES });
    tagsMock.mockReturnValue({ data: TAGS });
    stashMock.mockReturnValue({ data: STASH });
  });

  it('calls onSwitchBranch with the correct branch name on click', async () => {
    const onSwitchBranch = vi.fn();

    renderTree(onSwitchBranch);

    const button = screen.getByRole('button', { name: 'feature/auth' });
    await userEvent.click(button);

    expect(onSwitchBranch).toHaveBeenCalledWith('feature/auth');
  });

  it('does not call onSwitchBranch when the current branch is clicked', async () => {
    const onSwitchBranch = vi.fn();

    renderTree(onSwitchBranch);

    const currentButton = screen.getByRole('button', { name: 'main' });
    expect(currentButton).toBeDisabled();

    await userEvent.click(currentButton);

    expect(onSwitchBranch).not.toHaveBeenCalled();
  });
});