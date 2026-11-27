import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { useAppStore } from '@/app/store';
import type { Branch } from '@/entities/branch';
import type { Repository } from '@/entities/repository';
import type { Workspace } from '@/entities/workspace';
import { ThemeProvider } from '@/shared/lib/theme';

const mockWorkspaces = vi.hoisted((): Workspace[] => [
  {
    id: 'ws-1',
    name: 'Personal',
    path: '/Users/dev/personal',
    createdAt: 1700000000000
  },
  {
    id: 'ws-2',
    name: 'Work',
    path: '/Users/dev/work',
    createdAt: 1700000001000
  }
]);

const mockReposByWorkspace = vi.hoisted(
  (): Record<string, Repository[]> => ({
    '/Users/dev/personal': [
      {
        id: 'repo-1',
        path: '/Users/dev/personal/git-pawl',
        name: 'git-pawl',
        status: 'dirty',
        currentBranch: 'feat/ux',
        hasRemote: true,
        remoteUrl: 'https://github.com/org/git-pawl.git',
        sizeBytes: 1024,
        gitBytes: 512,
        iconPath: null
      }
    ],
    '/Users/dev/work': [
      {
        id: 'repo-2',
        path: '/Users/dev/work/billing-api',
        name: 'billing-api',
        status: 'clean',
        currentBranch: 'main',
        hasRemote: true,
        remoteUrl: 'https://github.com/org/billing-api.git',
        sizeBytes: 2048,
        gitBytes: 256,
        iconPath: null
      }
    ]
  })
);

const mockBranches = vi.hoisted((): Branch[] => [
  {
    name: 'main',
    target: 'abc1234',
    current: true,
    commits: ['abc1234']
  },
  {
    name: 'feature/palette',
    target: 'def5678',
    current: false,
    commits: ['def5678']
  }
]);

const checkoutMutateMock = vi.hoisted(() => vi.fn());

vi.mock('@/entities/workspace', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/entities/workspace')>();
  return {
    ...actual,
    useWorkspaceList: () => ({
      data: mockWorkspaces,
      isLoading: false
    }),
    useWorkspaceExtraRepoPaths: () => ({
      data: [],
      isLoading: false
    })
  };
});

vi.mock('@/entities/repository', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/entities/repository')>();
  return {
    ...actual,
    useRepositoryList: (workspacePath: string | null) => ({
      data: workspacePath ? (mockReposByWorkspace[workspacePath] ?? []) : [],
      isLoading: false
    })
  };
});

vi.mock('@/entities/branch', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/entities/branch')>();
  return {
    ...actual,
    useBranches: (repoPath: string | null) => ({
      data: repoPath ? mockBranches : [],
      isLoading: false
    }),
    useCheckoutBranch: () => ({
      mutate: checkoutMutateMock,
      isPending: false
    })
  };
});

import { CommandPalette } from './CommandPalette';

const LocationProbe = (): ReactNode => {
  const location = useLocation();
  return <div data-testid="location-probe">{location.pathname}</div>;
};

type RenderPaletteOptions = {
  initialPath?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onToggleSidebar?: () => void;
};

const renderPalette = (options: RenderPaletteOptions = {}): ReturnType<typeof render> => {
  const {
    initialPath = '/workspaces',
    open,
    onOpenChange,
    onToggleSidebar
  } = options;
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <MemoryRouter initialEntries={[initialPath]}>
          <LocationProbe />
          <CommandPalette
            open={open}
            onOpenChange={onOpenChange}
            onToggleSidebar={onToggleSidebar}
          />
        </MemoryRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

beforeAll(() => {
  if (typeof globalThis.ResizeObserver === 'undefined') {
    globalThis.ResizeObserver = class {
      observe = (): void => {};
      unobserve = (): void => {};
      disconnect = (): void => {};
    } as unknown as typeof ResizeObserver;
  }
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = (): void => {};
  }
});

describe('CommandPalette', () => {
  beforeEach(() => {
    checkoutMutateMock.mockReset();
    useAppStore.setState({
      activeWorkspaceId: null,
      theme: 'dark'
    });
    document.documentElement.dataset.theme = 'dark';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('opens on Cmd+K and Ctrl+K, and closes on Escape', async () => {
    renderPalette();

    expect(
      screen.queryByPlaceholderText(
        'Search repositories, workspaces, branches, or actions…'
      )
    ).not.toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'k', metaKey: true });

    const input = await screen.findByPlaceholderText(
      'Search repositories, workspaces, branches, or actions…'
    );
    expect(input).toBeInTheDocument();

    await userEvent.keyboard('{Escape}');

    await waitFor(() => {
      expect(
        screen.queryByPlaceholderText(
          'Search repositories, workspaces, branches, or actions…'
        )
      ).not.toBeInTheDocument();
    });

    fireEvent.keyDown(window, { key: 'K', ctrlKey: true });

    expect(
      await screen.findByPlaceholderText(
        'Search repositories, workspaces, branches, or actions…'
      )
    ).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });

    await waitFor(() => {
      expect(
        screen.queryByPlaceholderText(
          'Search repositories, workspaces, branches, or actions…'
        )
      ).not.toBeInTheDocument();
    });
  });

  it('displays and filters workspaces and repositories, and shows empty state when nothing matches', async () => {
    const user = userEvent.setup();
    renderPalette({ open: true });

    expect(screen.getByText('git-pawl')).toBeInTheDocument();
    expect(screen.getByText('billing-api')).toBeInTheDocument();
    expect(screen.getByLabelText('Repository status: dirty')).toBeInTheDocument();
    expect(screen.getByText('feat/ux')).toBeInTheDocument();
    expect(screen.getAllByText('Personal').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('Work').length).toBeGreaterThanOrEqual(2);

    const input = screen.getByPlaceholderText(
      'Search repositories, workspaces, branches, or actions…'
    );
    await user.type(input, 'billing');

    expect(screen.getByText('billing-api')).toBeInTheDocument();
    expect(screen.queryByText('git-pawl')).not.toBeInTheDocument();

    await user.clear(input);
    await user.type(input, 'zzznonexistent');

    expect(screen.getByText('No results found.')).toBeInTheDocument();
  });

  it('navigates to repository, sets active workspace, and closes when selecting a repository', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    renderPalette({ open: true, onOpenChange });

    await user.click(screen.getByText('billing-api'));

    expect(useAppStore.getState().activeWorkspaceId).toBe('ws-2');
    expect(screen.getByTestId('location-probe')).toHaveTextContent(
      `/repos/${encodeURIComponent('/Users/dev/work/billing-api')}`
    );
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('navigates to workspace, sets active workspace, and closes when selecting a workspace', async () => {
    const user = userEvent.setup();
    renderPalette();

    fireEvent.keyDown(window, { key: 'k', metaKey: true });

    const workMatches = await screen.findAllByText('Work');
    const workWorkspaceItem = workMatches.find((el) =>
      el.closest('[cmdk-item]')?.getAttribute('data-value')?.includes('workspace')
    );
    expect(workWorkspaceItem).toBeDefined();

    await user.click(workWorkspaceItem as HTMLElement);

    expect(useAppStore.getState().activeWorkspaceId).toBe('ws-2');
    expect(screen.getByTestId('location-probe')).toHaveTextContent('/workspaces/ws-2');
    await waitFor(() => {
      expect(
        screen.queryByPlaceholderText(
          'Search repositories, workspaces, branches, or actions…'
        )
      ).not.toBeInTheDocument();
    });
  });

  it('hides Branches group outside /repos/:id and shows Branches on /repos/:id with checkout mutation', async () => {
    const user = userEvent.setup();
    const { unmount } = renderPalette({ open: true, initialPath: '/workspaces' });

    expect(screen.queryByText('Branches')).not.toBeInTheDocument();
    expect(screen.queryByText('feature/palette')).not.toBeInTheDocument();

    unmount();

    const encodedRepo = encodeURIComponent('/Users/dev/personal/git-pawl');
    const onOpenChange = vi.fn();
    renderPalette({
      open: true,
      onOpenChange,
      initialPath: `/repos/${encodedRepo}`
    });

    expect(screen.getByText('Branches')).toBeInTheDocument();
    expect(screen.getByText('feature/palette')).toBeInTheDocument();
    expect(screen.getByText('Current')).toBeInTheDocument();

    await user.click(screen.getByText('feature/palette'));

    expect(checkoutMutateMock).toHaveBeenCalledTimes(1);
    expect(checkoutMutateMock).toHaveBeenCalledWith({
      repoPath: '/Users/dev/personal/git-pawl',
      ref: 'feature/palette'
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('does not trigger checkout when clicking the current branch', async () => {
    const user = userEvent.setup();
    const encodedRepo = encodeURIComponent('/Users/dev/personal/git-pawl');
    const onOpenChange = vi.fn();
    renderPalette({
      open: true,
      onOpenChange,
      initialPath: `/repos/${encodedRepo}`
    });

    const branchItems = screen.getAllByText('main');
    const branchItem = branchItems.find((el) =>
      el.closest('[cmdk-item]')?.getAttribute('data-value')?.includes('branch')
    );
    expect(branchItem).toBeDefined();

    await user.click(branchItem as HTMLElement);

    expect(checkoutMutateMock).not.toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('executes navigation, sidebar toggle, and theme toggle actions and closes palette', async () => {
    const user = userEvent.setup();
    const onToggleSidebar = vi.fn();
    const onOpenChange = vi.fn();

    renderPalette({
      open: true,
      onOpenChange,
      onToggleSidebar,
      initialPath: '/workspaces/ws-1'
    });

    await user.click(screen.getByText('Go to Workspaces'));
    expect(screen.getByTestId('location-probe')).toHaveTextContent('/workspaces');
    expect(onOpenChange).toHaveBeenCalledWith(false);

    onOpenChange.mockClear();
    await user.click(screen.getByText('Go to Settings'));
    expect(screen.getByTestId('location-probe')).toHaveTextContent('/settings');
    expect(onOpenChange).toHaveBeenCalledWith(false);

    onOpenChange.mockClear();
    await user.click(screen.getByText('Toggle Sidebar'));
    expect(onToggleSidebar).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);

    onOpenChange.mockClear();
    await user.click(screen.getByText('Toggle Theme'));
    expect(useAppStore.getState().theme).toBe('light');
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('hides Toggle Sidebar when onToggleSidebar is not provided', () => {
    renderPalette({ open: true });

    expect(screen.queryByText('Toggle Sidebar')).not.toBeInTheDocument();
  });
});
