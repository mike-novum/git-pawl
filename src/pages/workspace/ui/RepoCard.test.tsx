import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import type { ReactElement } from 'react';
import { describe, expect, it } from 'vitest';

import { Toast } from '@/shared/ui';
import type { Repository } from '@/entities/repository';

import { RepoCard } from './RepoCard';

const BASE_REPO: Repository = {
  id: 'repo-1',
  path: '/repos/example',
  name: 'example',
  status: 'clean',
  currentBranch: 'main',
  hasRemote: false,
  remoteUrl: null,
  sizeBytes: 1024,
  gitBytes: 128,
  iconPath: null
};

const createQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false
      }
    }
  });

const renderWithQuery = (ui: ReactElement) => {
  const queryClient = createQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <Toast.Provider>{ui}</Toast.Provider>
    </QueryClientProvider>
  );
};

describe('RepoCard', () => {
  it('renders repository name and branch', () => {
    renderWithQuery(<RepoCard repo={BASE_REPO} sizeBytes={1024} onClick={() => undefined} />);

    expect(screen.getByText('example')).toBeInTheDocument();
    expect(screen.getByText('main')).toBeInTheDocument();
  });

  it('renders the repository icon with the initial fallback when iconPath is null', () => {
    renderWithQuery(
      <RepoCard
        repo={{ ...BASE_REPO, iconPath: null }}
        sizeBytes={1024}
        onClick={() => undefined}
      />
    );

    expect(screen.getByText('E')).toBeInTheDocument();
  });

  it('renders an image when iconPath is provided', () => {
    renderWithQuery(
      <RepoCard
        repo={{ ...BASE_REPO, iconPath: '/repos/example/icon.png' }}
        sizeBytes={1024}
        onClick={() => undefined}
      />
    );

    const img = screen.getByRole('img', { name: 'example icon' });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src');
  });

  it('renders the icon with a jpg path', () => {
    renderWithQuery(
      <RepoCard
        repo={{ ...BASE_REPO, iconPath: '/repos/example/icon.jpg' }}
        sizeBytes={1024}
        onClick={() => undefined}
      />
    );

    const img = screen.getByRole('img', { name: 'example icon' });
    expect(img).toBeInTheDocument();
  });

  it('renders clean status badge when status is clean', () => {
    renderWithQuery(<RepoCard repo={BASE_REPO} sizeBytes={1024} onClick={() => undefined} />);

    expect(screen.getByText('Clean')).toBeInTheDocument();
  });
});
