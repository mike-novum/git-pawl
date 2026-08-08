import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { computeLayout } from '../lib/computeLayout';
import type { CommitNode } from '../types';

import { RepoGraphTable } from './RepoGraphTable';

const createCommit = (
  hash: string,
  parents: string[],
  subject: string,
  branches?: string[]
): CommitNode => ({
  hash,
  shortHash: hash.slice(0, 7),
  subject,
  author: 'Author',
  authorEmail: 'author@example.com',
  timestamp: 1700000000000,
  parents,
  lane: 0,
  branches
});

describe('RepoGraphTable', () => {
  it('renders five columns: Graph, Description, Commit, Author, Date', () => {
    const commits = [
      createCommit('aaaaaaaa', [], 'first commit'),
      createCommit('bbbbbbbb', ['aaaaaaaa'], 'second commit')
    ];
    const layout = computeLayout(commits);

    render(
      <RepoGraphTable
        layout={layout}
        selectedHash={null}
        onSelect={vi.fn()}
      />
    );

    const headers = screen.getAllByRole('columnheader');
    const labels = headers.map((header) => header.textContent?.trim() ?? '');
    expect(labels).toContain('Graph');
    expect(labels).toContain('Description');
    expect(labels).toContain('Commit');
    expect(labels).toContain('Author');
    expect(labels).toContain('Date');
  });

  it('hides author and date columns below the sm breakpoint', () => {
    const commits = [createCommit('aaaaaaaa', [], 'first commit')];
    const layout = computeLayout(commits);

    render(
      <RepoGraphTable
        layout={layout}
        selectedHash={null}
        onSelect={vi.fn()}
      />
    );

    const headers = screen.getAllByRole('columnheader');
    const authorHeader = headers.find(
      (header) => header.textContent === 'Author'
    );
    const dateHeader = headers.find(
      (header) => header.textContent === 'Date'
    );

    expect(authorHeader?.className).toContain('hidden');
    expect(dateHeader?.className).toContain('hidden');
  });

  it('orders branch chips before the subject', () => {
    const commits = [
      createCommit('aaaaaaaa', [], 'first commit', ['main'])
    ];
    const layout = computeLayout(commits);

    render(
      <RepoGraphTable
        layout={layout}
        selectedHash={null}
        onSelect={vi.fn()}
      />
    );

    const descriptionCell = screen.getByText('first commit');
    const branchChip = screen.getByText('main');

    expect(
      descriptionCell.compareDocumentPosition(branchChip) &
        Node.DOCUMENT_POSITION_PRECEDING
    ).toBeTruthy();
  });

  it('marks the selected row with aria-selected="true"', () => {
    const commits = [
      createCommit('aaaaaaaa', [], 'first commit'),
      createCommit('bbbbbbbb', ['aaaaaaaa'], 'second commit')
    ];
    const layout = computeLayout(commits);

    render(
      <RepoGraphTable
        layout={layout}
        selectedHash="aaaaaaaa"
        onSelect={vi.fn()}
      />
    );

    const rows = screen.getAllByRole('row').slice(1);
    const selectedRows = rows.filter(
      (row) => row.getAttribute('aria-selected') === 'true'
    );

    expect(selectedRows).toHaveLength(1);
    expect(selectedRows[0]?.textContent).toContain('first commit');
  });

  it('fires onSelect when a row is clicked', async () => {
    const commits = [
      createCommit('aaaaaaaa', [], 'first commit'),
      createCommit('bbbbbbbb', ['aaaaaaaa'], 'second commit')
    ];
    const layout = computeLayout(commits);
    const onSelect = vi.fn();

    render(
      <RepoGraphTable
        layout={layout}
        selectedHash={null}
        onSelect={onSelect}
      />
    );

    await userEvent.click(screen.getByText('first commit'));
    expect(onSelect).toHaveBeenCalledWith('aaaaaaaa');
  });

  it('renders resize handles with aria-orientation="vertical"', () => {
    const commits = [createCommit('aaaaaaaa', [], 'first commit')];
    const layout = computeLayout(commits);

    render(
      <RepoGraphTable
        layout={layout}
        selectedHash={null}
        onSelect={vi.fn()}
      />
    );

    const resizers = screen.getAllByRole('separator');
    resizers.forEach((resizer) => {
      expect(resizer.getAttribute('aria-orientation')).toBe('vertical');
    });
  });

  it('exposes a focusable, keyboard-operable resize handle', async () => {
    const commits = [createCommit('aaaaaaaa', [], 'first commit')];
    const layout = computeLayout(commits);

    render(
      <RepoGraphTable
        layout={layout}
        selectedHash={null}
        onSelect={vi.fn()}
      />
    );

    const resizer = screen.getAllByRole('separator')[0];
    if (!resizer) {
      throw new Error('Expected at least one resize handle');
    }
    resizer.focus();
    fireEvent.keyDown(resizer, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(resizer);
  });

  it('renders an accessible caption', () => {
    const commits = [createCommit('aaaaaaaa', [], 'first commit')];
    const layout = computeLayout(commits);

    const { container } = render(
      <RepoGraphTable
        layout={layout}
        selectedHash={null}
        onSelect={vi.fn()}
      />
    );

    const caption = container.querySelector('caption');
    expect(caption).not.toBeNull();
    expect(caption?.textContent).toBe('Commit graph');
  });

  it('shows a branch chip only for the tip commit of the branch', () => {
    const commits = [
      createCommit('ccccccc', ['bbbbbbb'], 'tip commit', ['feature-x']),
      createCommit('bbbbbbb', ['aaaaaaa'], 'middle commit', ['feature-x']),
      createCommit('aaaaaaa', [], 'root commit', ['feature-x'])
    ];
    const layout = computeLayout(commits);

    render(
      <RepoGraphTable
        layout={layout}
        selectedHash={null}
        onSelect={vi.fn()}
      />
    );

    expect(screen.getByTitle('Branch: feature-x')).toBeInTheDocument();
    expect(screen.getAllByTitle('Branch: feature-x')).toHaveLength(1);
  });

  it('does not render any branch chip for a commit not on any mainline branch', () => {
    const commits = [
      createCommit('tip', ['root'], 'tip commit', ['main']),
      createCommit('root', [], 'root commit', ['main']),
      createCommit('side', ['root'], 'side commit')
    ];
    const layout = computeLayout(commits);

    render(
      <RepoGraphTable
        layout={layout}
        selectedHash={null}
        onSelect={vi.fn()}
      />
    );

    expect(screen.getAllByTitle('Branch: main')).toHaveLength(1);
    expect(screen.getByText('side commit')).toBeInTheDocument();
  });

  it('renders a chip for every branch whose tip lands on the same commit', () => {
    const commits = [
      createCommit('merged', ['main-root'], 'merged commit', [
        'main',
        'feature-x'
      ]),
      createCommit('main-root', [], 'root commit', ['main'])
    ];
    const layout = computeLayout(commits);

    render(
      <RepoGraphTable
        layout={layout}
        selectedHash={null}
        onSelect={vi.fn()}
      />
    );

    expect(screen.getByTitle('Branch: feature-x')).toBeInTheDocument();
    expect(screen.getAllByTitle('Branch: main')).toHaveLength(1);
  });

  it('enlarges only the hovered row circle and resets others on mouse leave', () => {
    const commits = [
      createCommit('aaaaaaaa', [], 'first commit'),
      createCommit('bbbbbbbb', ['aaaaaaaa'], 'second commit'),
      createCommit('cccccccc', ['bbbbbbbb'], 'third commit')
    ];
    const layout = computeLayout(commits);

    const { container } = render(
      <RepoGraphTable
        layout={layout}
        selectedHash={null}
        onSelect={vi.fn()}
      />
    );

    const rows = screen.getAllByRole('row').slice(1);
    const secondRow = rows[1];
    if (!secondRow) {
      throw new Error('Expected at least two data rows');
    }

    expect(container.querySelectorAll('circle[r="6"]').length).toBe(0);

    fireEvent.mouseEnter(secondRow);
    expect(container.querySelectorAll('circle[r="6"]').length).toBe(1);
    expect(container.querySelectorAll('circle[r="5"]').length).toBe(2);

    fireEvent.mouseLeave(secondRow);
    expect(container.querySelectorAll('circle[r="6"]').length).toBe(0);
    expect(container.querySelectorAll('circle[r="5"]').length).toBe(3);
  });

  it('does not render branch or tag chips for the uncommitted row', () => {
    const commits: CommitNode[] = [
      {
        hash: 'UNCOMMITTED',
        shortHash: '------',
        subject: 'Uncommited changes',
        author: '',
        authorEmail: '',
        timestamp: 1700000000000,
        parents: ['aaaaaaaa'],
        lane: 0,
        color: 'var(--color-muted-foreground)',
        isUncommitted: true
      },
      createCommit('aaaaaaaa', [], 'first commit')
    ];
    const layout = computeLayout(commits);

    render(
      <RepoGraphTable
        layout={layout}
        selectedHash={null}
        onSelect={vi.fn()}
      />
    );

    expect(screen.getByText('Uncommited changes')).toBeInTheDocument();
    expect(screen.queryByTitle('Branch: main')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Tag: v1')).not.toBeInTheDocument();
    expect(screen.queryByText('author@example.com')).not.toBeInTheDocument();
  });
});
