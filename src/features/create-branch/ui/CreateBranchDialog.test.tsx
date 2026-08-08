import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';

const mutateMock = vi.hoisted(() => vi.fn());
const toastSuccessMock = vi.hoisted(() => vi.fn());
const toastErrorMock = vi.hoisted(() => vi.fn());

vi.mock('../model', () => ({
  useCreateBranch: () => ({
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
    type,
    variant,
    className,
    disabled
  }: {
    children?: ReactNode;
    loading?: boolean;
    leftIcon?: ReactNode;
    onClick?: (event: { preventDefault?: () => void }) => void;
    type?: 'button' | 'submit' | 'reset';
    variant?: string;
    className?: string;
    disabled?: boolean;
  }) => (
    <button
      type={type ?? 'button'}
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
  Dialog: {
    Root: ({
      children,
      onOpenChange
    }: {
      children?: ReactNode;
      onOpenChange?: (open: boolean) => void;
    }) => (
      <div>
        {children}
        {onOpenChange ? (
          <button
            type="button"
            data-testid="dialog-close-trigger"
            onClick={() => onOpenChange(false)}
          >
            close
          </button>
        ) : null}
      </div>
    ),
    Portal: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
    Backdrop: () => null,
    Content: ({ children }: { children?: ReactNode }) => <div>{children}</div>
  },
  Input: ({
    value,
    onChange,
    disabled,
    id
  }: {
    value?: string;
    onChange?: (event: { target: { value: string } }) => void;
    disabled?: boolean;
    id?: string;
  }) => (
    <input
      id={id}
      value={value ?? ''}
      disabled={disabled}
      onChange={(event) => onChange?.({ target: { value: event.target.value } })}
    />
  ),
  useToast: () => ({
    show: vi.fn(),
    success: toastSuccessMock,
    error: toastErrorMock,
    info: vi.fn(),
    close: vi.fn()
  })
}));

import { CreateBranchDialog } from './CreateBranchDialog';

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

describe('CreateBranchDialog', () => {
  beforeEach(() => {
    mutateMock.mockReset();
    toastSuccessMock.mockReset();
    toastErrorMock.mockReset();
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

  it('disables the Create button while the name input is empty', () => {
    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <CreateBranchDialog
          open
          onOpenChange={vi.fn()}
          repoPath="/tmp/repo"
        />
      </Wrapper>
    );

    const createButton = screen.getByRole('button', { name: /create/i });
    expect(createButton).toBeDisabled();
  });

  it('calls mutate with the entered name and the create flag on submit', async () => {
    const user = userEvent.setup();
    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <CreateBranchDialog
          open
          onOpenChange={vi.fn()}
          repoPath="/tmp/repo"
        />
      </Wrapper>
    );

    const input = screen.getByLabelText(/branch name/i);
    await user.type(input, 'feature/new-branch');

    await act(async () => {
      screen.getByRole('button', { name: /create/i }).click();
    });

    expect(mutateMock).toHaveBeenCalledTimes(1);
    expect(mutateMock).toHaveBeenCalledWith(
      { repoPath: '/tmp/repo', ref: 'feature/new-branch' },
      expect.objectContaining({
        onSuccess: expect.any(Function),
        onError: expect.any(Function)
      })
    );
  });

  it('trims surrounding whitespace from the name before mutate', async () => {
    const user = userEvent.setup();
    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <CreateBranchDialog
          open
          onOpenChange={vi.fn()}
          repoPath="/tmp/repo"
        />
      </Wrapper>
    );

    const input = screen.getByLabelText(/branch name/i);
    await user.type(input, '  feature/x  ');

    await act(async () => {
      screen.getByRole('button', { name: /create/i }).click();
    });

    expect(mutateMock).toHaveBeenCalledTimes(1);
    expect(mutateMock).toHaveBeenCalledWith(
      { repoPath: '/tmp/repo', ref: 'feature/x' },
      expect.any(Object)
    );
  });

  it('shows a success toast and closes the dialog when creation succeeds', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <CreateBranchDialog
          open
          onOpenChange={onOpenChange}
          repoPath="/tmp/repo"
        />
      </Wrapper>
    );

    const input = screen.getByLabelText(/branch name/i);
    await user.type(input, 'feature/auth');

    await act(async () => {
      screen.getByRole('button', { name: /create/i }).click();
    });

    await waitFor(() => {
      expect(toastSuccessMock).toHaveBeenCalledTimes(1);
    });
    expect(toastSuccessMock).toHaveBeenCalledWith({
      title: 'Ветка feature/auth создана'
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('shows an error toast and keeps the dialog open when creation fails', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    mutateMock.mockImplementationOnce(
      (
        _input: unknown,
        options?: { onError?: (err: Error) => void }
      ) => {
        options?.onError?.(new Error('branch exists'));
      }
    );

    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <CreateBranchDialog
          open
          onOpenChange={onOpenChange}
          repoPath="/tmp/repo"
        />
      </Wrapper>
    );

    const input = screen.getByLabelText(/branch name/i);
    await user.type(input, 'duplicate');

    await act(async () => {
      screen.getByRole('button', { name: /create/i }).click();
    });

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledTimes(1);
    });
    expect(toastErrorMock).toHaveBeenCalledWith({
      title: 'Не удалось создать ветку duplicate',
      description: 'branch exists'
    });
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });
});

describe('CreateBranchDialog loading state', () => {
  beforeEach(() => {
    vi.resetModules();
    mutateMock.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the spinner on the Create button while the mutation is pending', async () => {
    vi.doMock('../model', () => ({
      useCreateBranch: () => ({
        mutate: mutateMock,
        mutateAsync: vi.fn(),
        isPending: true,
        isError: false,
        error: null,
        reset: vi.fn()
      })
    }));

    const { CreateBranchDialog: LoadingCreateBranchDialog } = await import(
      './CreateBranchDialog'
    );

    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <LoadingCreateBranchDialog
          open
          onOpenChange={vi.fn()}
          repoPath="/tmp/repo"
        />
      </Wrapper>
    );

    const input = screen.getByLabelText(/branch name/i);
    expect(input).toBeDisabled();

    const button = screen.getByRole('button', { name: /create/i });
    expect(button.getAttribute('data-loading')).toBe('true');
    expect(button.querySelector('[data-testid="spinner"]')).toBeTruthy();
  });

  it('does not close the dialog when a dismiss request arrives while pending', async () => {
    vi.doMock('../model', () => ({
      useCreateBranch: () => ({
        mutate: mutateMock,
        mutateAsync: vi.fn(),
        isPending: true,
        isError: false,
        error: null,
        reset: vi.fn()
      })
    }));

    const { CreateBranchDialog: PendingCreateBranchDialog } = await import(
      './CreateBranchDialog'
    );

    const onOpenChange = vi.fn();
    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <PendingCreateBranchDialog
          open
          onOpenChange={onOpenChange}
          repoPath="/tmp/repo"
        />
      </Wrapper>
    );

    const closeTrigger = screen.getByTestId('dialog-close-trigger');
    await act(async () => {
      closeTrigger.click();
    });

    expect(onOpenChange).not.toHaveBeenCalled();
  });
});