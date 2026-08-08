import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';

const mutateMock = vi.hoisted(() => vi.fn());
const toastSuccessMock = vi.hoisted(() => vi.fn());
const toastErrorMock = vi.hoisted(() => vi.fn());

let pending = false;

vi.mock('../model', () => ({
  useGitFetch: () => ({
    mutate: mutateMock,
    mutateAsync: vi.fn(),
    isPending: pending,
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
    rightIcon,
    onClick,
    variant,
    className,
    disabled,
    ...rest
  }: {
    children?: ReactNode;
    loading?: boolean;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    onClick?: () => void;
    variant?: string;
    className?: string;
    disabled?: boolean;
  } & Record<string, unknown>) => (
    <button
      type="button"
      data-loading={loading ? 'true' : undefined}
      data-variant={variant}
      className={className}
      disabled={disabled}
      onClick={onClick}
      {...rest}
    >
      {!loading && leftIcon}
      {!loading && rightIcon}
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

import { FetchButton } from './FetchButton';

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

describe('FetchButton iconOnly', () => {
  beforeEach(() => {
    mutateMock.mockReset();
    toastSuccessMock.mockReset();
    toastErrorMock.mockReset();
    pending = false;
    mutateMock.mockImplementation(
      (
        _input: unknown,
        options?: { onSuccess?: () => void; onError?: (err: Error) => void }
      ) => {
        options?.onSuccess?.();
      }
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders only the icon and no branch label when iconOnly is true', () => {
    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <FetchButton repoPath="/tmp/repo" branchName="main" iconOnly />
      </Wrapper>
    );

    const button = screen.getByRole('button', { name: /fetch/i });
    expect(button).toBeInTheDocument();
    expect(button).not.toHaveTextContent('main');
    expect(button).not.toHaveTextContent('current');
  });

  it('still renders the branch label when iconOnly is false', () => {
    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <FetchButton repoPath="/tmp/repo" branchName="main" />
      </Wrapper>
    );

    expect(screen.getByRole('button', { name: /main/i })).toBeInTheDocument();
  });

  it('calls mutate on click with the repoPath', async () => {
    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <FetchButton repoPath="/tmp/repo" iconOnly />
      </Wrapper>
    );

    await act(async () => {
      screen.getByRole('button', { name: /fetch/i }).click();
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

  it('shows the success toast with the fetch text when fetch succeeds', async () => {
    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <FetchButton repoPath="/tmp/repo" iconOnly />
      </Wrapper>
    );

    await act(async () => {
      screen.getByRole('button', { name: /fetch/i }).click();
    });

    await waitFor(() => {
      expect(toastSuccessMock).toHaveBeenCalledTimes(1);
    });
    expect(toastSuccessMock).toHaveBeenCalledWith({
      title: 'Фетч выполнен'
    });
  });

  it('shows the error toast when fetch fails', async () => {
    mutateMock.mockImplementationOnce(
      (
        _input: unknown,
        options?: { onError?: (err: Error) => void }
      ) => {
        options?.onError?.(new Error('no remote configured'));
      }
    );

    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <FetchButton repoPath="/tmp/repo" iconOnly />
      </Wrapper>
    );

    await act(async () => {
      screen.getByRole('button', { name: /fetch/i }).click();
    });

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledTimes(1);
    });
    expect(toastErrorMock).toHaveBeenCalledWith({
      title: 'Не удалось выполнить fetch',
      description: 'no remote configured'
    });
  });

  it('does not call mutate when repoPath is empty', () => {
    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <FetchButton repoPath="" iconOnly />
      </Wrapper>
    );

    const button = screen.getByRole('button', { name: /fetch/i });
    expect(button).toBeDisabled();
    button.click();
    expect(mutateMock).not.toHaveBeenCalled();
  });
});

describe('FetchButton loading state', () => {
  beforeEach(() => {
    mutateMock.mockReset();
    pending = true;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    pending = false;
  });

  it('adds the animate-spin class to the icon when isPending is true', () => {
    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <FetchButton repoPath="/tmp/repo" iconOnly />
      </Wrapper>
    );

    const button = screen.getByRole('button', { name: /fetch/i });
    expect(button).toBeDisabled();
    const icon = button.querySelector('svg');
    expect(icon).not.toBeNull();
    expect(icon?.getAttribute('class') ?? '').toContain('animate-spin');
  });
});
