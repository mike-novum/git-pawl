import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';

const mutateMock = vi.hoisted(() => vi.fn());
const toastSuccessMock = vi.hoisted(() => vi.fn());
const toastErrorMock = vi.hoisted(() => vi.fn());

vi.mock('@/entities/branch', () => ({
  useBranches: vi.fn(),
  useCheckoutBranch: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false
  }))
}));

vi.mock('@/entities/tag', () => ({
  useTags: vi.fn()
}));

vi.mock('@/entities/stash', () => ({
  useStashList: vi.fn()
}));

vi.mock('@/features/create-branch/model', () => ({
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
    onClick,
    type,
    variant,
    className,
    disabled
  }: {
    children?: ReactNode;
    loading?: boolean;
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
      {children}
    </button>
  ),
  Dialog: {
    Root: ({
      children,
      open,
      onOpenChange
    }: {
      children?: ReactNode;
      open?: boolean;
      onOpenChange?: (open: boolean) => void;
    }) =>
      open ? (
        <div data-testid="dialog-root">
          {children}
          <button
            type="button"
            data-testid="dialog-close-trigger"
            onClick={() => onOpenChange?.(false)}
          >
            close
          </button>
        </div>
      ) : null,
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

import type { Branch } from '@/entities/branch';
import type { StashEntry } from '@/entities/stash';
import type { Tag } from '@/entities/tag';

import { useBranches } from '@/entities/branch';
import { useStashList } from '@/entities/stash';
import { useTags } from '@/entities/tag';

import { RepoTree } from './RepoTree';

const branchesMock = useBranches as ReturnType<typeof vi.fn>;
const tagsMock = useTags as ReturnType<typeof vi.fn>;
const stashMock = useStashList as ReturnType<typeof vi.fn>;

const BRANCHES: Branch[] = [
  {
    name: 'main',
    target: 'aaaaaaa',
    current: true,
    commits: ['aaaaaaa'],
    upstream: undefined
  }
];

const TAGS: Tag[] = [];
const STASH: StashEntry[] = [];

const createQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false
      }
    }
  });

const renderTree = (
  onSwitchBranch?: (branchName: string) => void
): ReturnType<typeof render> => {
  const queryClient = createQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <RepoTree
        repoPath="/tmp/repo"
        selectedCommit={null}
        onSelectCommit={vi.fn()}
        {...(onSwitchBranch ? { onSwitchBranch } : {})}
      />
    </QueryClientProvider>
  );
};

describe('RepoTree + CreateBranchDialog integration', () => {
  beforeEach(() => {
    branchesMock.mockReturnValue({ data: BRANCHES });
    tagsMock.mockReturnValue({ data: TAGS });
    stashMock.mockReturnValue({ data: STASH });
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

  it('does not call onSwitchBranch after a branch is created via the dialog', async () => {
    const user = userEvent.setup();
    const onSwitchBranch = vi.fn();

    renderTree(onSwitchBranch);

    await user.click(screen.getByRole('button', { name: /new branch/i }));

    const input = screen.getByLabelText(/branch name/i);
    await user.type(input, 'feature/integration');

    await act(async () => {
      screen.getByRole('button', { name: /create/i }).click();
    });

    await waitFor(() => {
      expect(toastSuccessMock).toHaveBeenCalledTimes(1);
    });

    expect(toastSuccessMock).toHaveBeenCalledWith({
      title: 'Ветка feature/integration создана'
    });
    expect(onSwitchBranch).not.toHaveBeenCalled();
  });
});