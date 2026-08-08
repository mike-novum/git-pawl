import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';

const gitCheckoutMock = vi.hoisted(() => vi.fn());
const toastSuccessMock = vi.hoisted(() => vi.fn());
const toastErrorMock = vi.hoisted(() => vi.fn());

vi.mock('@/shared/api', () => ({
  gitCheckout: gitCheckoutMock
}));

vi.mock('@/shared/ui', () => ({
  useToast: () => ({
    show: vi.fn(),
    success: toastSuccessMock,
    error: toastErrorMock,
    info: vi.fn(),
    close: vi.fn()
  })
}));

import { useCheckoutBranch } from './useCheckoutBranch';

const createWrapper = (queryClient: QueryClient) => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = 'QueryClientWrapper';
  return Wrapper;
};

describe('useCheckoutBranch', () => {
  beforeEach(() => {
    gitCheckoutMock.mockReset();
    toastSuccessMock.mockReset();
    toastErrorMock.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('sends a payload with the `ref` field (not `target`) to gitCheckout', async () => {
    gitCheckoutMock.mockResolvedValueOnce(null);

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } }
    });
    const { result } = renderHook(() => useCheckoutBranch(), {
      wrapper: createWrapper(queryClient)
    });

    act(() => {
      result.current.mutate({ repoPath: '/tmp/repo', ref: 'feature/auth' });
    });

    await waitFor(() => {
      expect(gitCheckoutMock).toHaveBeenCalledTimes(1);
    });

    expect(gitCheckoutMock).toHaveBeenCalledWith({
      repoPath: '/tmp/repo',
      ref: 'feature/auth',
      create: false
    });
    const payload = gitCheckoutMock.mock.calls[0]?.[0] as Record<
      string,
      unknown
    >;
    expect(payload).toHaveProperty('ref');
    expect(payload).not.toHaveProperty('target');
  });

  it('invalidates current-branch, branch-list, git-log and branch-mainlines on success', async () => {
    gitCheckoutMock.mockResolvedValueOnce(null);

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } }
    });
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useCheckoutBranch(), {
      wrapper: createWrapper(queryClient)
    });

    act(() => {
      result.current.mutate({ repoPath: '/tmp/repo', ref: 'feature/auth' });
    });

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalled();
    });

    const calledKeys = invalidateSpy.mock.calls.map(
      (call) => (call[0] as { queryKey: readonly unknown[] }).queryKey[0]
    );
    expect(calledKeys).toEqual(
      expect.arrayContaining([
        'current-branch',
        'branch-list',
        'git-log',
        'branch-mainlines'
      ])
    );
  });

  it('shows a success toast with the ref name on success', async () => {
    gitCheckoutMock.mockResolvedValueOnce(null);

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } }
    });
    const { result } = renderHook(() => useCheckoutBranch(), {
      wrapper: createWrapper(queryClient)
    });

    act(() => {
      result.current.mutate({ repoPath: '/tmp/repo', ref: 'feature/auth' });
    });

    await waitFor(() => {
      expect(toastSuccessMock).toHaveBeenCalledTimes(1);
    });
    expect(toastSuccessMock).toHaveBeenCalledWith({
      title: 'Ветка feature/auth переключена'
    });
  });

  it('shows an error toast with the ref name when gitCheckout rejects', async () => {
    const failure = new Error('ref: Required');
    gitCheckoutMock.mockRejectedValueOnce(failure);

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } }
    });
    const { result } = renderHook(() => useCheckoutBranch(), {
      wrapper: createWrapper(queryClient)
    });

    act(() => {
      result.current.mutate({ repoPath: '/tmp/repo', ref: 'feature/auth' });
    });

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledTimes(1);
    });
    expect(toastErrorMock).toHaveBeenCalledWith({
      title: 'Не удалось переключить ветку feature/auth',
      description: 'ref: Required'
    });
  });
});