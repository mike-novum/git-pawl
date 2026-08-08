import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';

const mutateMock = vi.hoisted(() => vi.fn());
const toastSuccessMock = vi.hoisted(() => vi.fn());
const toastErrorMock = vi.hoisted(() => vi.fn());

vi.mock('../model', () => ({
  useGitPull: () => ({
    mutate: mutateMock,
    mutateAsync: vi.fn(),
    isPending: false,
    isError: false,
    error: null,
    reset: vi.fn()
  })
}));

vi.mock('@/shared/ui', () => ({
  Button: ({
    children,
    loading,
    leftIcon,
    onClick,
    variant,
    className,
    disabled
  }: {
    children?: ReactNode;
    loading?: boolean;
    leftIcon?: ReactNode;
    onClick?: () => void;
    variant?: string;
    className?: string;
    disabled?: boolean;
  }) => (
    <button
      type="button"
      data-loading={loading ? 'true' : undefined}
      data-variant={variant}
      className={className}
      disabled={disabled}
      onClick={onClick}
    >
      {!loading && leftIcon}
      {loading ? <span data-testid="spinner" /> : null}
      {children}
    </button>
  ),
  useToast: () => ({
    show: vi.fn(),
    success: toastSuccessMock,
    error: toastErrorMock,
    info: vi.fn(),
    close: vi.fn()
  })
}));

import { PullButton } from './PullButton';

const createWrapper = (): (({ children }: { children: ReactNode }) => ReactNode) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = 'QueryClientWrapper';
  return Wrapper;
};

describe('PullButton', () => {
  beforeEach(() => {
    mutateMock.mockReset();
    toastSuccessMock.mockReset();
    toastErrorMock.mockReset();
    mutateMock.mockImplementation(
      (_input: unknown, options?: { onSuccess?: () => void; onError?: (err: Error) => void }) => {
        options?.onSuccess?.();
      }
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the Pull label and the icon when not loading', () => {
    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <PullButton repoPath="/tmp/repo" branchName="feature/auth" />
      </Wrapper>
    );

    expect(screen.getByRole('button', { name: /pull/i })).toBeInTheDocument();
  });

  it('passes the variant prop down to the underlying Button', () => {
    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <PullButton repoPath="/tmp/repo" variant="primary" />
      </Wrapper>
    );

    const button = screen.getByRole('button', { name: /pull/i });
    expect(button.getAttribute('data-variant')).toBe('primary');
  });

  it('calls mutate on click with the repoPath', async () => {
    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <PullButton repoPath="/tmp/repo" />
      </Wrapper>
    );

    await act(async () => {
      screen.getByRole('button', { name: /pull/i }).click();
    });

    expect(mutateMock).toHaveBeenCalledTimes(1);
    expect(mutateMock).toHaveBeenCalledWith(
      { repoPath: '/tmp/repo' },
      expect.objectContaining({
        onSuccess: expect.any(Function),
        onError: expect.any(Function)
      })
    );
  });

  it('shows a success toast with the branch name when pull succeeds', async () => {
    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <PullButton repoPath="/tmp/repo" branchName="feature/auth" />
      </Wrapper>
    );

    await act(async () => {
      screen.getByRole('button', { name: /pull/i }).click();
    });

    await waitFor(() => {
      expect(toastSuccessMock).toHaveBeenCalledTimes(1);
    });
    expect(toastSuccessMock).toHaveBeenCalledWith({
      title: 'Пулл ветки feature/auth выполнен'
    });
  });

  it('shows an error toast with the branch name when pull fails', async () => {
    mutateMock.mockImplementationOnce(
      (_input: unknown, options?: { onError?: (err: Error) => void }) => {
        options?.onError?.(new Error('network down'));
      }
    );

    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <PullButton repoPath="/tmp/repo" branchName="feature/auth" />
      </Wrapper>
    );

    await act(async () => {
      screen.getByRole('button', { name: /pull/i }).click();
    });

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledTimes(1);
    });
    expect(toastErrorMock).toHaveBeenCalledWith({
      title: 'Не удалось выполнить pull ветки feature/auth',
      description: 'network down'
    });
  });

  it('does not call mutate when repoPath is empty', () => {
    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <PullButton repoPath="" />
      </Wrapper>
    );

    const button = screen.getByRole('button', { name: /pull/i });
    expect(button).toBeDisabled();
    button.click();
    expect(mutateMock).not.toHaveBeenCalled();
  });
});

describe('PullButton loading state', () => {
  beforeEach(() => {
    vi.resetModules();
    mutateMock.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows the spinner and hides the icon when loading is true', async () => {
    vi.doMock('../model', () => ({
      useGitPull: () => ({
        mutate: mutateMock,
        mutateAsync: vi.fn(),
        isPending: true,
        isError: false,
        error: null,
        reset: vi.fn()
      })
    }));

    const { PullButton: LoadingPullButton } = await import('./PullButton');

    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <LoadingPullButton repoPath="/tmp/repo" />
      </Wrapper>
    );

    const button = screen.getByRole('button', { name: /pull/i });
    expect(button.getAttribute('data-loading')).toBe('true');
    expect(button.querySelector('[data-testid="spinner"]')).toBeTruthy();
  });
});
