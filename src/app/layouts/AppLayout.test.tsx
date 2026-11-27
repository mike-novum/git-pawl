import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { useAppStore } from '@/app/store';
import type { Branch } from '@/entities/branch';
import type { Repository } from '@/entities/repository';
import type { Workspace } from '@/entities/workspace';
import { ThemeProvider } from '@/shared/lib/theme';
import { Toast } from '@/shared/ui';

const mockWorkspaces = vi.hoisted((): Workspace[] => [
  {
    id: 'ws-1',
    name: 'Personal',
    path: '/Users/dev/personal',
    createdAt: 1000
  },
  {
    id: 'ws-2',
    name: 'Work',
    path: '/Users/dev/work',
    createdAt: 2000
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
        remoteUrl: null,
        sizeBytes: 1024,
        gitBytes: 512,
        iconPath: null
      }
    ],
    '/Users/dev/work': [
      {
        id: 'repo-2',
        path: '/Users/dev/work/api-service',
        name: 'api-service',
        status: 'clean',
        currentBranch: 'main',
        hasRemote: true,
        remoteUrl: null,
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
  }
]);

vi.mock('@/entities/workspace', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/entities/workspace')>();
  return {
    ...actual,
    useWorkspaceList: () => ({
      data: mockWorkspaces,
      isLoading: false
    }),
    useWorkspaceById: (id: string | null) =>
      mockWorkspaces.find((w) => w.id === id) ?? null,
    useActiveWorkspace: () => null,
    useWorkspaceExtraRepoPaths: () => ({
      data: [],
      isLoading: false
    }),
    useWorkspaceIcon: () => ({
      data: null
    }),
    WorkspaceIcon: ({ workspace }: { workspace: Workspace }) => (
      <span data-testid={`workspace-icon-${workspace.id}`} />
    )
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
      mutate: vi.fn(),
      isPending: false
    })
  };
});

vi.mock('@/features/workspace-create', () => ({
  CreateWorkspaceDialog: () => null
}));

vi.mock('@/features/total-size', () => ({
  WorkspaceTotalSize: () => null
}));

import { AppLayout } from './AppLayout';

const LocationProbe = (): ReactNode => {
  const location = useLocation();
  return <div data-testid="location-probe">{location.pathname}</div>;
};

const renderAppLayout = (initialPath = '/workspaces'): ReturnType<typeof render> => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Toast.Provider>
          <MemoryRouter initialEntries={[initialPath]}>
            <Routes>
              <Route element={<AppLayout />}>
                <Route path="/workspaces" element={<LocationProbe />} />
                <Route path="/workspaces/:id" element={<LocationProbe />} />
                <Route path="/repos/:id" element={<LocationProbe />} />
                <Route path="/settings" element={<LocationProbe />} />
              </Route>
            </Routes>
          </MemoryRouter>
        </Toast.Provider>
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
  if (!Element.prototype.getAnimations) {
    Element.prototype.getAnimations = (): Animation[] => [];
  }
});

describe('AppLayout', () => {
  beforeEach(() => {
    useAppStore.setState({
      sidebarOpen: true,
      activeWorkspaceId: 'ws-1',
      theme: 'dark'
    });
  });

  it('renders AppSidebar when sidebarOpen is true and toggles via header button', async () => {
    const user = userEvent.setup();
    renderAppLayout('/workspaces');

    expect(
      screen.getByRole('complementary', { name: 'Workspace navigation' })
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Hide sidebar' }));

    expect(useAppStore.getState().sidebarOpen).toBe(false);
    expect(
      screen.queryByRole('complementary', { name: 'Workspace navigation' })
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Show sidebar' }));

    expect(useAppStore.getState().sidebarOpen).toBe(true);
    expect(
      screen.getByRole('complementary', { name: 'Workspace navigation' })
    ).toBeInTheDocument();
  });

  it('renders CommandPalette and opens it when clicking the header command palette button', async () => {
    const user = userEvent.setup();
    renderAppLayout('/workspaces');

    expect(
      screen.queryByPlaceholderText(
        'Search repositories, workspaces, branches, or actions…'
      )
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Open command palette' }));

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText(
          'Search repositories, workspaces, branches, or actions…'
        )
      ).toBeInTheDocument();
    });
  });

  it('renders clickable workspace and repository breadcrumbs on /repos/:id and navigates on click', async () => {
    const user = userEvent.setup();
    useAppStore.setState({ activeWorkspaceId: 'ws-1' });
    const repoPath = '/Users/dev/work/api-service';

    const { unmount } = renderAppLayout(`/repos/${encodeURIComponent(repoPath)}`);

    const breadcrumbNav = screen.getByRole('navigation', { name: 'Breadcrumb' });
    expect(within(breadcrumbNav).getByRole('button', { name: 'Workspaces' })).toBeInTheDocument();
    expect(within(breadcrumbNav).getByRole('button', { name: 'Work' })).toBeInTheDocument();
    expect(within(breadcrumbNav).getByText('api-service')).toHaveAttribute(
      'title',
      repoPath
    );

    await user.click(within(breadcrumbNav).getByRole('button', { name: 'Work' }));

    expect(useAppStore.getState().activeWorkspaceId).toBe('ws-2');
    expect(screen.getByTestId('location-probe')).toHaveTextContent('/workspaces/ws-2');

    unmount();

    renderAppLayout(`/repos/${encodeURIComponent(repoPath)}`);

    const remountedBreadcrumb = screen.getByRole('navigation', { name: 'Breadcrumb' });
    await user.click(
      within(remountedBreadcrumb).getByRole('button', { name: 'Workspaces' })
    );

    expect(screen.getByTestId('location-probe')).toHaveTextContent('/workspaces');
  });

  it('renders Settings label in header on /settings route', () => {
    renderAppLayout('/settings');

    const header = screen.getByRole('banner');
    expect(within(header).getByRole('button', { name: 'Back' })).toBeInTheDocument();
    expect(within(header).getByText('Settings')).toBeInTheDocument();
  });
});
