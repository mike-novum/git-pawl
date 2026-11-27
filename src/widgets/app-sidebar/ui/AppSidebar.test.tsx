import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useAppStore } from '@/app/store';
import type { Repository } from '@/entities/repository';
import type { Workspace } from '@/entities/workspace';

vi.mock('@/entities/workspace', () => ({
  useWorkspaceList: vi.fn(),
  useWorkspaceExtraRepoPaths: vi.fn(),
  useWorkspaceIcon: vi.fn(),
  WorkspaceIcon: ({ workspace }: { workspace: Workspace }) => (
    <span data-testid={`workspace-icon-${workspace.id}`} />
  )
}));

vi.mock('@/entities/repository', () => ({
  useRepositoryList: vi.fn()
}));

vi.mock('@/features/workspace-create', () => ({
  CreateWorkspaceDialog: ({ open }: { open: boolean }) =>
    open ? <div role="dialog" aria-label="New workspace dialog" /> : null
}));

import { useRepositoryList } from '@/entities/repository';
import {
  useWorkspaceExtraRepoPaths,
  useWorkspaceIcon,
  useWorkspaceList
} from '@/entities/workspace';

import { AppSidebar } from './AppSidebar';

const workspaceListMock = useWorkspaceList as ReturnType<typeof vi.fn>;
const extraRepoPathsMock = useWorkspaceExtraRepoPaths as ReturnType<typeof vi.fn>;
const workspaceIconMock = useWorkspaceIcon as ReturnType<typeof vi.fn>;
const repositoryListMock = useRepositoryList as ReturnType<typeof vi.fn>;

const WORKSPACES: Workspace[] = [
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
];

const PERSONAL_REPOS: Repository[] = [
  {
    id: 'repo-1',
    path: '/Users/dev/personal/git-pawl',
    name: 'git-pawl',
    status: 'dirty',
    currentBranch: 'feat/sidebar',
    hasRemote: true,
    remoteUrl: null,
    sizeBytes: null,
    gitBytes: null,
    iconPath: null
  },
  {
    id: 'repo-2',
    path: '/Users/dev/personal/notes',
    name: 'notes',
    status: 'clean',
    currentBranch: 'main',
    hasRemote: true,
    remoteUrl: null,
    sizeBytes: null,
    gitBytes: null,
    iconPath: null
  }
];

const WORK_REPOS: Repository[] = [
  {
    id: 'repo-3',
    path: '/Users/dev/work/api-service',
    name: 'api-service',
    status: 'unknown',
    currentBranch: null,
    hasRemote: false,
    remoteUrl: null,
    sizeBytes: null,
    gitBytes: null,
    iconPath: null
  }
];

const LocationDisplay = () => {
  const location = useLocation();
  return <div data-testid="current-location">{location.pathname}</div>;
};

const createQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false
      }
    }
  });

const renderSidebar = (initialPath = '/workspaces'): ReturnType<typeof render> => {
  const queryClient = createQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialPath]}>
        <AppSidebar />
        <LocationDisplay />
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('AppSidebar', () => {
  beforeEach(() => {
    useAppStore.setState({
      sidebarOpen: true,
      activeWorkspaceId: 'ws-1'
    });

    workspaceListMock.mockReturnValue({
      data: WORKSPACES,
      isLoading: false
    });
    extraRepoPathsMock.mockReturnValue({ data: [] });
    workspaceIconMock.mockReturnValue({ data: null });
    repositoryListMock.mockImplementation((workspacePath: string | null) => {
      if (workspacePath === '/Users/dev/personal') {
        return { data: PERSONAL_REPOS, isLoading: false };
      }
      if (workspacePath === '/Users/dev/work') {
        return { data: WORK_REPOS, isLoading: false };
      }
      return { data: [], isLoading: false };
    });
  });

  it('renders workspaces and repositories for active workspace', () => {
    renderSidebar();

    expect(screen.getByRole('complementary', { name: 'Workspace navigation' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Personal\b/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Work\b/ })).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /git-pawl/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /notes/ })).toBeInTheDocument();
    expect(screen.getByText('feat/sidebar')).toBeInTheDocument();
    expect(screen.getByLabelText('Dirty repository')).toBeInTheDocument();
    expect(screen.getByLabelText('Clean repository')).toBeInTheDocument();

    expect(screen.queryByRole('button', { name: /api-service/ })).not.toBeInTheDocument();
  });

  it('navigates in 1 click to repository route and updates activeWorkspaceId', async () => {
    useAppStore.setState({ activeWorkspaceId: null });
    renderSidebar('/workspaces/ws-2');

    await userEvent.click(screen.getByRole('button', { name: /api-service/ }));

    expect(useAppStore.getState().activeWorkspaceId).toBe('ws-2');
    expect(screen.getByTestId('current-location')).toHaveTextContent(
      `/repos/${encodeURIComponent('/Users/dev/work/api-service')}`
    );
  });

  it('navigates to workspace page and updates activeWorkspaceId when clicking a workspace', async () => {
    renderSidebar('/workspaces');

    await userEvent.click(screen.getByRole('button', { name: /^Work\b/ }));

    expect(useAppStore.getState().activeWorkspaceId).toBe('ws-2');
    expect(screen.getByTestId('current-location')).toHaveTextContent('/workspaces/ws-2');
  });

  it('highlights active workspace and active repository', () => {
    const repoPath = '/Users/dev/personal/git-pawl';
    renderSidebar(`/repos/${encodeURIComponent(repoPath)}`);

    const repoButton = screen.getByRole('button', { name: /git-pawl/ });
    expect(repoButton).toHaveAttribute('aria-current', 'page');
    expect(repoButton).toHaveAttribute('data-active', 'true');

    const otherRepoButton = screen.getByRole('button', { name: /notes/ });
    expect(otherRepoButton).not.toHaveAttribute('aria-current', 'page');
    expect(otherRepoButton).toHaveAttribute('data-active', 'false');

    const personalWrapper = screen
      .getByRole('button', { name: /^Personal\b/ })
      .closest('[data-active]');
    expect(personalWrapper).toHaveAttribute('data-active', 'true');
  });

  it('highlights workspaces nav link and settings link when on matching routes', async () => {
    renderSidebar('/workspaces');

    expect(screen.getByRole('button', { name: 'Workspaces' })).toHaveAttribute(
      'aria-current',
      'page'
    );

    await userEvent.click(screen.getByRole('button', { name: 'Settings' }));

    expect(screen.getByTestId('current-location')).toHaveTextContent('/settings');
    expect(screen.getByRole('button', { name: 'Settings' })).toHaveAttribute(
      'aria-current',
      'page'
    );
  });

  it('toggles collapse and expand of workspace repository lists', async () => {
    renderSidebar('/workspaces');

    expect(screen.getByRole('button', { name: /git-pawl/ })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Collapse Personal' }));
    expect(screen.queryByRole('button', { name: /git-pawl/ })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Expand Work' }));
    expect(screen.getByRole('button', { name: /api-service/ })).toBeInTheDocument();
  });

  it('toggles sidebar visibility via Cmd+B keyboard shortcut', () => {
    renderSidebar('/workspaces');

    expect(screen.getByRole('complementary', { name: 'Workspace navigation' })).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'b', metaKey: true });

    expect(useAppStore.getState().sidebarOpen).toBe(false);
    expect(
      screen.queryByRole('complementary', { name: 'Workspace navigation' })
    ).not.toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'b', ctrlKey: true });

    expect(useAppStore.getState().sidebarOpen).toBe(true);
    expect(screen.getByRole('complementary', { name: 'Workspace navigation' })).toBeInTheDocument();
  });

  it('opens CreateWorkspaceDialog when clicking New workspace', async () => {
    renderSidebar('/workspaces');

    expect(screen.queryByRole('dialog', { name: 'New workspace dialog' })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'New workspace' }));

    expect(screen.getByRole('dialog', { name: 'New workspace dialog' })).toBeInTheDocument();
  });
});
