import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Workspace } from '../model/types';
import { WorkspaceIcon } from './WorkspaceIcon';

const fsReadImageDataUrlMock = vi.hoisted(() => vi.fn());

vi.mock('@/shared/api', () => ({
  fsReadImageDataUrl: fsReadImageDataUrlMock
}));

const WORKSPACE: Workspace = {
  id: 'workspace-1',
  name: 'My workspace',
  path: '/workspaces/my-workspace',
  createdAt: 1
};

const createQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false
      }
    }
  });

const renderIcon = (iconPath: string) => {
  const queryClient = createQueryClient();

  return render(
    <QueryClientProvider client={queryClient}>
      <WorkspaceIcon workspace={WORKSPACE} iconPath={iconPath} />
    </QueryClientProvider>
  );
};

describe('WorkspaceIcon', () => {
  beforeEach(() => {
    fsReadImageDataUrlMock.mockReset();
  });

  it('renders fallback while the image source is loading and the image after it arrives', async () => {
    const src = 'data:image/png;base64,valid';
    let resolveRead: (value: string | null) => void = () => undefined;

    fsReadImageDataUrlMock.mockReturnValueOnce(
      new Promise<string | null>((resolve) => {
        resolveRead = resolve;
      })
    );

    renderIcon('/icons/valid.png');

    expect(screen.queryByRole('img')).not.toBeInTheDocument();

    await act(async () => {
      resolveRead(src);
    });

    expect(await screen.findByRole('img')).toHaveAttribute('src', src);
  });

  it('renders fallback when the image file cannot be read', async () => {
    fsReadImageDataUrlMock.mockResolvedValueOnce(null);

    renderIcon('/icons/missing.png');

    await waitFor(() => {
      expect(fsReadImageDataUrlMock).toHaveBeenCalledOnce();
    });
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('renders a valid image after a different path fails to load', async () => {
    const validSrc = 'data:image/png;base64,valid';
    fsReadImageDataUrlMock
      .mockResolvedValueOnce('data:image/png;base64,broken')
      .mockResolvedValueOnce(validSrc);

    const queryClient = createQueryClient();
    const { rerender } = render(
      <QueryClientProvider client={queryClient}>
        <WorkspaceIcon workspace={WORKSPACE} iconPath="/icons/broken.png" />
      </QueryClientProvider>
    );

    fireEvent.error(await screen.findByRole('img'));
    expect(screen.queryByRole('img')).not.toBeInTheDocument();

    rerender(
      <QueryClientProvider client={queryClient}>
        <WorkspaceIcon workspace={WORKSPACE} iconPath="/icons/valid.png" />
      </QueryClientProvider>
    );

    expect(await screen.findByRole('img')).toHaveAttribute('src', validSrc);
  });
});
