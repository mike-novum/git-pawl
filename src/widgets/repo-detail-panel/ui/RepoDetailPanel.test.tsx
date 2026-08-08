import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import type { FC, ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { CommitNode } from '@/widgets/repo-graph-vertical';

vi.mock('@/entities/file-change', () => ({
  useCommitFiles: vi.fn(() => ({
    data: [],
    isLoading: false,
    isError: false
  })),
  FILE_CHANGE_STATUS_LABELS: {
    M: 'Modified',
    A: 'Added',
    D: 'Deleted',
    '??': 'Untracked',
    R: 'Renamed',
    '!!': 'Ignored'
  }
}));

vi.mock('@/widgets/file-changes-panel', () => ({
  FileChangesPanel: ({
    repoPath
  }: {
    repoPath: string | null;
    className?: string;
  }) => (
    <div data-testid="file-changes-panel" data-repo-path={repoPath ?? ''}>
      FileChangesPanel mock
    </div>
  )
}));

vi.mock('@/widgets/commit-message-form', () => ({
  CommitMessageForm: ({
    onCommit
  }: {
    onCommit: (message: { header: string }) => void;
  }) => (
    <button
      type="button"
      data-testid="commit-message-form-submit"
      onClick={() => onCommit({ header: 'feat: test commit' })}
    >
      CommitMessageForm mock
    </button>
  )
}));

import { RepoDetailPanel } from './RepoDetailPanel';

const createQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });

const wrap = (children: ReactNode): ReturnType<typeof render> => {
  const queryClient = createQueryClient();
  const Wrapper: FC = () => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return render(<Wrapper />);
};

const baseCommit: CommitNode = {
  hash: 'abc1234567890',
  shortHash: 'abc1234',
  subject: 'feat: commit subject',
  author: 'Alice',
  authorEmail: 'alice@example.com',
  timestamp: 1_700_000_000_000,
  parents: ['parent-hash'],
  lane: 0,
  branches: [],
  tags: [],
  isUncommitted: false,
  kind: 'commit'
};

const baseProps = {
  repoPath: '/tmp/repo',
  onCopyHash: vi.fn(),
  onCreatePatch: vi.fn(),
  onCherryPick: vi.fn(),
  onRevert: vi.fn(),
  onResetToHere: vi.fn(),
  onCommit: vi.fn()
};

const uncommittedCommit: CommitNode = {
  ...baseCommit,
  hash: 'UNCOMMITTED',
  shortHash: '------',
  subject: 'Uncommited changes',
  author: '',
  authorEmail: '',
  parents: [],
  isUncommitted: true,
  kind: 'uncommitted'
};

describe('RepoDetailPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders a placeholder when commit is null', () => {
    wrap(<RepoDetailPanel {...baseProps} commit={null} />);

    expect(screen.getByText(/select a commit/i)).toBeInTheDocument();
  });

  it('renders commit info and footer actions for a normal commit', () => {
    wrap(<RepoDetailPanel {...baseProps} commit={baseCommit} />);

    expect(screen.getByText(baseCommit.subject)).toBeInTheDocument();
    expect(screen.getByText(/alice/i)).toBeInTheDocument();
    expect(screen.getByText(baseCommit.shortHash)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /patch/i })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /cherry-pick/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /revert/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
  });

  it('renders uncommitted view with heading and commit form', () => {
    wrap(<RepoDetailPanel {...baseProps} commit={uncommittedCommit} />);

    expect(
      screen.getByRole('heading', { name: /uncommited changes/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/select files to commit/i)).toBeInTheDocument();
    expect(screen.getByTestId('file-changes-panel')).toBeInTheDocument();
    expect(screen.getByTestId('commit-message-form-submit')).toBeInTheDocument();
  });

  it('invokes onCommit with header string when the form is submitted', () => {
    const onCommit = vi.fn();

    wrap(
      <RepoDetailPanel
        {...baseProps}
        commit={uncommittedCommit}
        onCommit={onCommit}
      />
    );

    screen.getByTestId('commit-message-form-submit').click();

    expect(onCommit).toHaveBeenCalledWith('feat: test commit');
  });
});
