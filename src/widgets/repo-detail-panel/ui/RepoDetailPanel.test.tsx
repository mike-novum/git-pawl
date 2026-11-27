import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import type { FC, ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { CommitNode } from '@/widgets/repo-graph-vertical';

vi.mock('@/entities/file-change', () => ({
  useCommitFiles: vi.fn(() => ({
    data: [
      { path: 'src/App.tsx', status: 'M', isStaged: false, isUnstaged: true }
    ],
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

vi.mock('@/features/preview-diff', () => ({
  DiffViewer: ({ file, range }: { file?: string; range?: string }) => (
    <div data-testid="diff-viewer" data-file={file ?? ''} data-range={range ?? ''}>
      DiffViewer mock
    </div>
  )
}));

vi.mock('@/widgets/file-changes-panel', () => ({
  FileChangesPanel: ({
    repoPath,
    onSelectChange
  }: {
    repoPath: string | null;
    selectedFile?: string | null;
    onSelectChange?: (path: string) => void;
    className?: string;
  }) => (
    <div data-testid="file-changes-panel" data-repo-path={repoPath ?? ''}>
      FileChangesPanel mock
      <button
        type="button"
        data-testid="select-file-change"
        onClick={() => onSelectChange?.('src/index.ts')}
      >
        Select file
      </button>
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
    expect(screen.getByRole('button', { name: /copy hash/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /commit actions/i })).toBeInTheDocument();
  });

  it('opens diff viewer when a commit file is clicked and allows switching back', () => {
    wrap(<RepoDetailPanel {...baseProps} commit={baseCommit} />);

    const fileItem = screen.getByText('src/App.tsx');
    fireEvent.click(fileItem);

    expect(screen.getByTestId('diff-viewer')).toBeInTheDocument();
    expect(screen.getByTestId('diff-viewer')).toHaveAttribute('data-file', 'src/App.tsx');

    const backButton = screen.getByRole('button', { name: /back to files/i });
    fireEvent.click(backButton);

    expect(screen.getByText('src/App.tsx')).toBeInTheDocument();
  });

  it('allows viewing full commit diff', () => {
    wrap(<RepoDetailPanel {...baseProps} commit={baseCommit} />);

    const fullDiffButton = screen.getByRole('button', { name: /view commit diff/i });
    fireEvent.click(fullDiffButton);

    expect(screen.getByTestId('diff-viewer')).toBeInTheDocument();
    expect(screen.getByTestId('diff-viewer')).toHaveAttribute('data-file', '');
    expect(screen.getByTestId('diff-viewer')).toHaveAttribute(
      'data-range',
      `${baseCommit.hash}^!`
    );
  });

  it('renders uncommitted view with heading and commit form', () => {
    wrap(<RepoDetailPanel {...baseProps} commit={uncommittedCommit} />);

    expect(
      screen.getByRole('heading', { name: /uncommitted changes/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/select files to commit/i)).toBeInTheDocument();
    expect(screen.getByTestId('file-changes-panel')).toBeInTheDocument();
    expect(screen.getByTestId('commit-message-form-submit')).toBeInTheDocument();
  });

  it('switches to diff view when a file is selected from file changes panel in uncommitted view', () => {
    wrap(<RepoDetailPanel {...baseProps} commit={uncommittedCommit} />);

    fireEvent.click(screen.getByTestId('select-file-change'));

    expect(screen.getByTestId('diff-viewer')).toBeInTheDocument();
    expect(screen.getByTestId('diff-viewer')).toHaveAttribute('data-file', 'src/index.ts');
    expect(screen.getByTestId('diff-viewer')).toHaveAttribute('data-range', 'HEAD');

    fireEvent.click(screen.getByRole('button', { name: /back to changes/i }));
    expect(screen.getByTestId('file-changes-panel')).toBeInTheDocument();
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
