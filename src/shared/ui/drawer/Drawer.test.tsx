import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Drawer } from './Drawer';

describe('Drawer', () => {
  it('does not render content when closed', () => {
    render(<Drawer open={false} onOpenChange={() => {}} title="X">Body</Drawer>);
    expect(screen.queryByText('Body')).not.toBeInTheDocument();
    expect(screen.queryByText('X')).not.toBeInTheDocument();
  });

  it('renders title and body when open', () => {
    render(<Drawer open onOpenChange={() => {}} title="Settings">Body</Drawer>);
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Body')).toBeInTheDocument();
  });

  it('calls onOpenChange(false) on Esc key', async () => {
    const onChange = vi.fn();
    render(<Drawer open onOpenChange={onChange} title="X">Body</Drawer>);
    await userEvent.keyboard('{Escape}');
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it('calls onOpenChange(false) on backdrop click', async () => {
    const onChange = vi.fn();
    const { baseElement } = render(
      <Drawer open onOpenChange={onChange} title="X">Body</Drawer>
    );
    const backdrop = baseElement.querySelector('[data-testid="drawer-backdrop"]');
    expect(backdrop).toBeTruthy();
    await userEvent.click(backdrop as HTMLElement);
    expect(onChange).toHaveBeenCalledWith(false);
  });
});
