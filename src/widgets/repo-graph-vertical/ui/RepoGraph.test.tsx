import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { RepoGraph } from './RepoGraph';

describe('RepoGraph', () => {
  it('shows loading state before the git log resolves', () => {
    render(
      <RepoGraph
        commits={[]}
        selectedHash={null}
        onSelect={vi.fn()}
        isLoading
      />
    );

    expect(screen.getByText('Loading commits...')).toBeInTheDocument();
    expect(screen.queryByText('No commits')).not.toBeInTheDocument();
  });

  it('shows an error instead of an empty repository when git log fails', () => {
    render(
      <RepoGraph
        commits={[]}
        selectedHash={null}
        onSelect={vi.fn()}
        isError
      />
    );

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Failed to load commits.'
    );
    expect(screen.queryByText('No commits')).not.toBeInTheDocument();
  });
});
