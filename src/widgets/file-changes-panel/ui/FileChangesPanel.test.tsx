import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import type { FC, ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockUseFileChanges = vi.fn();
const mockUseSelectedFiles = vi.fn();

vi.mock('@/entities/file-change', () => ({
  useFileChanges: (...args: unknown[]) => mockUseFileChanges(...args),
  useSelectedFiles: (...args: unknown[]) => mockUseSelectedFiles(...args),
  FILE_CHANGE_STATUS_LABELS: {
    M: 'Modified',
    A: 'Added',
    D: 'Deleted',
    '??': 'Untracked',
    R: 'Renamed',
    '!!': 'Ignored'
  }
}));

import { FileChangesPanel } from './FileChangesPanel';

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

describe('FileChangesPanel', () => {
  const selectAll = vi.fn();
  const deselectAll = vi.fn();
  const toggle = vi.fn();
  const onSelectChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSelectedFiles.mockReturnValue({
      selected: ['src/staged.ts'],
      count: 1,
      isSelected: (path: string) => path === 'src/staged.ts',
      toggle,
      selectAll,
      deselectAll
    });
  });

  it('renders clean state when there are no changes', () => {
    mockUseFileChanges.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false
    });

    wrap(<FileChangesPanel repoPath="/tmp/repo" />);

    expect(screen.getByText(/working tree is clean/i)).toBeInTheDocument();
  });

  it('renders changes and handles staging controls', () => {
    mockUseFileChanges.mockReturnValue({
      data: [
        { path: 'src/main.ts', status: 'M', isStaged: false, isUnstaged: true },
        { path: 'src/staged.ts', status: 'A', isStaged: true, isUnstaged: false }
      ],
      isLoading: false,
      isError: false
    });

    wrap(
      <FileChangesPanel
        repoPath="/tmp/repo"
        onSelectChange={onSelectChange}
      />
    );

    expect(screen.getByText('main.ts')).toBeInTheDocument();
    expect(screen.getByText('staged.ts')).toBeInTheDocument();

    const stageAllButton = screen.getByRole('button', { name: /^stage all$/i });
    fireEvent.click(stageAllButton);
    expect(selectAll).toHaveBeenCalledWith(['src/main.ts', 'src/staged.ts']);

    const unstageAllButton = screen.getByRole('button', { name: /unstage all/i });
    fireEvent.click(unstageAllButton);
    expect(deselectAll).toHaveBeenCalled();

    const row = screen.getByRole('button', { name: /modified: src\/main.ts/i });
    fireEvent.click(row);
    expect(onSelectChange).toHaveBeenCalledWith('src/main.ts');
  });

  it('toggles individual file staging when checkbox is clicked', () => {
    mockUseFileChanges.mockReturnValue({
      data: [
        { path: 'src/main.ts', status: 'M', isStaged: false, isUnstaged: true }
      ],
      isLoading: false,
      isError: false
    });

    wrap(<FileChangesPanel repoPath="/tmp/repo" />);

    const checkbox = screen.getByRole('checkbox', { name: /stage src\/main.ts/i });
    fireEvent.click(checkbox);
    expect(toggle).toHaveBeenCalledWith('src/main.ts');
  });
});
