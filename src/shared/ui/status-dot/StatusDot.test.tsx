import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { StatusDot } from './StatusDot';

describe('StatusDot', () => {
  it('renders with aria-label for the variant when label is not provided', () => {
    render(<StatusDot variant="clean" data-testid="dot" />);
    expect(screen.getByTestId('dot')).toHaveAttribute('aria-label', 'clean');
  });

  it('uses provided label over variant default', () => {
    render(<StatusDot variant="warning" label="uncommitted changes" />);
    expect(screen.getByLabelText('uncommitted changes')).toBeInTheDocument();
  });

  it('applies variant-specific color class', () => {
    const { rerender } = render(<StatusDot variant="clean" data-testid="dot" />);
    expect(screen.getByTestId('dot').className).toMatch(/bg-success/);

    rerender(<StatusDot variant="warning" data-testid="dot" />);
    expect(screen.getByTestId('dot').className).toMatch(/bg-warning/);

    rerender(<StatusDot variant="danger" data-testid="dot" />);
    expect(screen.getByTestId('dot').className).toMatch(/bg-danger/);
  });
});
