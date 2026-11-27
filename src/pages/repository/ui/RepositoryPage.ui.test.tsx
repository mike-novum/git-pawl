import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import type { FC, ReactNode } from 'react';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import type { Branch } from '@/entities/branch';

const branchesMock = vi.hoisted((): { current: Branch[] } => ({
  current: []
}));

vi.mock('react-router-dom', () => ({
  useParams: () => ({ id: encodeURIComponent('/tmp/repo') })
}));

vi.mock('@/entities/repository', () => ({
  useRepository: () => ({
    data: {
      id: '/tmp/repo',
      name: 'git-pawl',
      path: '/tmp/repo',
      status: 'clean'
    },
    isLoading: false
  })
}));

vi.mock('@/entities/branch', () => ({
  useCurrentBranch: () => ({
    data: { name: 'main' }
  }),
  useBranches: () => ({
    data: branchesMock.current
  }),
  useCheckoutBranch: () => ({
    mutate: vi.fn()
  })
}));

vi.mock('@/entities/tag', () => ({
  useTags: () => ({ data: [] })
}));

vi.mock('@/entities/stash', () => ({
  useStashList: () => ({ data: [] })
}));

vi.mock('@/features/commit-changes', () => ({
  useCommit: () => ({
    mutate: vi.fn(),
    isPending: false
  })
}));

vi.mock('@/shared/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/api')>();
  return {
    ...actual,
    gitLog: vi.fn().mockResolvedValue([]),
    gitPull: vi.fn().mockResolvedValue(undefined),
    gitPush: vi.fn().mockResolvedValue(undefined)
  };
});

vi.mock('@/shared/ui', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/ui')>();
  return {
    ...actual,
    useToast: () => ({
      show: vi.fn(),
      success: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
      close: vi.fn()
    })
  };
});

vi.mock('@/features/open-in-agent', () => ({
  OpenInAgent: () => <button type="button">Agent</button>
}));

vi.mock('@/features/open-in-finder', () => ({
  OpenInFinder: () => <button type="button">Finder</button>
}));

vi.mock('@/features/open-in-terminal', () => ({
  OpenInTerminal: () => <button type="button">Terminal</button>
}));

vi.mock('@/features/git-fetch', () => ({
  FetchButton: () => <button type="button">Fetch</button>
}));

vi.mock('@/widgets/repo-tree', () => ({
  RepoTree: () => <div data-testid="repo-tree">RepoTree</div>
}));

vi.mock('@/widgets/repo-graph-vertical', () => ({
  computeLayout: () => ({ rows: [], maxLane: 0 }),
  RepoGraph: ({ className }: { className?: string }) => (
    <div data-testid="repo-graph" className={className}>
      RepoGraph
    </div>
  )
}));

import { RepositoryPage } from './RepositoryPage';

const renderPage = (): ReturnType<typeof render> => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });
  const Wrapper: FC<{ children: ReactNode }> = ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return render(
    <Wrapper>
      <RepositoryPage />
    </Wrapper>
  );
};

const makeBranch = (ahead: number, behind: number): Branch => ({
  name: 'main',
  target: 'abc123',
  current: true,
  commits: ['abc123'],
  upstream: {
    ref: 'origin/main',
    ahead,
    behind
  }
});

describe('RepositoryPage UI', () => {
  beforeAll(() => {
    if (typeof globalThis.ResizeObserver === 'undefined') {
      globalThis.ResizeObserver = class ResizeObserver {
        observe = (): void => {};
        unobserve = (): void => {};
        disconnect = (): void => {};
      };
    }
  });

  beforeEach(() => {
    branchesMock.current = [makeBranch(0, 0)];
  });

  it('renders RepoTree, RepoGraph, and RepoDetailPanel inside resizable panels with separators', () => {
    renderPage();

    expect(screen.getByTestId('repo-tree')).toBeInTheDocument();
    expect(screen.getByTestId('repo-graph')).toBeInTheDocument();
    expect(screen.getByText(/select a commit/i)).toBeInTheDocument();

    const separators = screen.getAllByRole('separator');
    expect(separators).toHaveLength(2);
    expect(screen.getByTestId('repository-page-panels')).toBeInTheDocument();
    expect(screen.getByTestId('repo-tree-panel')).toBeInTheDocument();
    expect(screen.getByTestId('repo-graph-panel')).toBeInTheDocument();
    expect(screen.getByTestId('repo-detail-panel')).toBeInTheDocument();
  });

  it('renders both Pull and Push as secondary when ahead and behind are 0', () => {
    branchesMock.current = [makeBranch(0, 0)];
    renderPage();

    const pullButton = screen.getByRole('button', { name: /pull/i });
    const pushButton = screen.getByRole('button', { name: /push/i });

    expect(pullButton).toHaveClass('bg-muted');
    expect(pullButton).not.toHaveClass('bg-primary');
    expect(pushButton).toHaveClass('bg-muted');
    expect(pushButton).not.toHaveClass('bg-primary');
    expect(screen.queryByText(/↓\d+/)).not.toBeInTheDocument();
    expect(screen.queryByText(/↑\d+/)).not.toBeInTheDocument();
  });

  it('highlights Push as primary with ↑count and keeps Pull secondary when ahead > 0 and behind === 0', () => {
    branchesMock.current = [makeBranch(3, 0)];
    renderPage();

    const pullButton = screen.getByRole('button', { name: /pull/i });
    const pushButton = screen.getByRole('button', { name: /push/i });

    expect(pushButton).toHaveClass('bg-primary');
    expect(pullButton).toHaveClass('bg-muted');
    expect(pullButton).not.toHaveClass('bg-primary');
    expect(pushButton).toHaveTextContent('↑3');
    expect(pullButton).not.toHaveTextContent(/↓\d+/);
  });

  it('highlights Pull as primary with ↓count only when behind > 0 and ahead === 0', () => {
    branchesMock.current = [makeBranch(0, 5)];
    renderPage();

    const pullButton = screen.getByRole('button', { name: /pull/i });
    const pushButton = screen.getByRole('button', { name: /push/i });

    expect(pullButton).toHaveClass('bg-primary');
    expect(pushButton).toHaveClass('bg-muted');
    expect(pushButton).not.toHaveClass('bg-primary');
    expect(pullButton).toHaveTextContent('↓5');
    expect(pushButton).not.toHaveTextContent(/↑\d+/);
  });

  it('never renders both Pull and Push as primary when both ahead > 0 and behind > 0', () => {
    branchesMock.current = [makeBranch(2, 4)];
    renderPage();

    const pullButton = screen.getByRole('button', { name: /pull/i });
    const pushButton = screen.getByRole('button', { name: /push/i });

    expect(pushButton).toHaveClass('bg-primary');
    expect(pullButton).toHaveClass('bg-muted');
    expect(pullButton).not.toHaveClass('bg-primary');
    expect(pushButton).toHaveTextContent('↑2');
    expect(pullButton).toHaveTextContent('↓4');
  });
});
