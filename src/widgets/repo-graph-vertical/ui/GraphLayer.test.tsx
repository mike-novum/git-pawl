import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { computeLayout } from '../lib/computeLayout';
import type { CommitNode } from '../types';

import { GraphLayer } from './GraphLayer';

const createCommit = (
  hash: string,
  parents: string[],
  subject: string
): CommitNode => ({
  hash,
  shortHash: hash.slice(0, 7),
  subject,
  author: 'Author',
  authorEmail: 'author@example.com',
  timestamp: 1700000000000,
  parents,
  lane: 0
});

describe('GraphLayer', () => {
  it('renders a single svg that contains both lines and commit circles', () => {
    const commits = [
      createCommit('aaaaaaaa', ['bbbbbbbb'], 'second commit'),
      createCommit('bbbbbbbb', ['cccccccc'], 'third commit'),
      createCommit('cccccccc', [], 'root commit')
    ];
    const layout = computeLayout(commits);

    const { container } = render(
      <svg width="0" height="0">
        <foreignObject>
          <div>
            <GraphLayer layout={layout} selectedHash={null} />
          </div>
        </foreignObject>
      </svg>
    );

    const svgs = container.querySelectorAll('svg');
    const innerSvg = svgs[0]?.querySelector('svg');
    expect(innerSvg).not.toBeNull();

    const paths = innerSvg?.querySelectorAll('path') ?? [];
    const circles = innerSvg?.querySelectorAll('circle') ?? [];

    expect(paths.length).toBeGreaterThan(0);
    expect(circles.length).toBe(layout.rows.length);
  });

  it('renders one continuous vertical line between two consecutive same-lane commits', () => {
    const commits = [
      createCommit('aaaaaaaa', ['bbbbbbbb'], 'second'),
      createCommit('bbbbbbbb', ['cccccccc'], 'third'),
      createCommit('cccccccc', [], 'root')
    ];
    const layout = computeLayout(commits);

    expect(layout.continuousLines).toHaveLength(2);
    expect(layout.continuousLines.every((line) => line.fromLane === line.toLane)).toBe(true);
  });

  it('renders a halo circle around the selected commit only', () => {
    const commits = [
      createCommit('aaaaaaaa', ['bbbbbbbb'], 'second'),
      createCommit('bbbbbbbb', [], 'root')
    ];
    const layout = computeLayout(commits);

    const { container } = render(
      <div>
        <GraphLayer layout={layout} selectedHash="aaaaaaaa" />
        <GraphLayer layout={layout} selectedHash={null} />
      </div>
    );

    const allHalos = container.querySelectorAll('circle[stroke-opacity="0.4"]');
    expect(allHalos.length).toBe(1);

    const allNodeCircles = container.querySelectorAll('circle');
    expect(allNodeCircles.length).toBe(layout.rows.length * 2 + 1);
  });

  it('keeps commit circles at base radius when nothing is hovered', () => {
    const commits = [
      createCommit('aaaaaaaa', [], 'root')
    ];
    const layout = computeLayout(commits);

    const { container } = render(<GraphLayer layout={layout} selectedHash={null} />);

    const commitCircle = container.querySelector('circle[r="5"]');
    expect(commitCircle).not.toBeNull();
  });

  it('enlarges only the hovered row circle and keeps the rest at base radius', () => {
    const commits = [
      createCommit('aaaaaaaa', [], 'root'),
      createCommit('bbbbbbbb', ['aaaaaaaa'], 'second'),
      createCommit('cccccccc', ['bbbbbbbb'], 'third')
    ];
    const layout = computeLayout(commits);

    const { container } = render(
      <GraphLayer layout={layout} selectedHash={null} hoveredRowIndex={1} />
    );

    const baseCircles = container.querySelectorAll('circle[r="5"]');
    const hoveredCircles = container.querySelectorAll('circle[r="6"]');

    expect(baseCircles.length).toBe(2);
    expect(hoveredCircles.length).toBe(1);
  });

  it('resets all circles to base radius when hoveredRowIndex is null', () => {
    const commits = [
      createCommit('aaaaaaaa', [], 'root'),
      createCommit('bbbbbbbb', ['aaaaaaaa'], 'second')
    ];
    const layout = computeLayout(commits);

    const { container } = render(
      <GraphLayer layout={layout} selectedHash={null} hoveredRowIndex={null} />
    );

    const baseCircles = container.querySelectorAll('circle[r="5"]');
    const hoveredCircles = container.querySelectorAll('circle[r="6"]');

    expect(baseCircles.length).toBe(2);
    expect(hoveredCircles.length).toBe(0);
  });

  it('uses absolute coordinates in the rendered SVG paths', () => {
    const commits = [
      createCommit('aaaaaaaa', ['bbbbbbbb'], 'second'),
      createCommit('bbbbbbbb', [], 'root')
    ];
    const layout = computeLayout(commits);

    const { container } = render(<GraphLayer layout={layout} selectedHash={null} />);

    const paths = container.querySelectorAll('path');
    paths.forEach((path) => {
      const d = path.getAttribute('d') ?? '';
      expect(d).not.toMatch(/0 16/);
      expect(d).not.toMatch(/0 32/);
    });
  });
});
