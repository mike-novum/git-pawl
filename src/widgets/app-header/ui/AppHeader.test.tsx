import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { ThemeProvider } from '@/shared/lib/theme';

import type { AppHeaderProps } from '../types';

import { AppHeader } from './AppHeader';

const renderHeader = (
  hideSettings = false,
  initialPath = '/'
): ReturnType<typeof render> =>
  render(
    <ThemeProvider>
      <MemoryRouter initialEntries={[initialPath]}>
        <AppHeader variant="home" hideSettings={hideSettings} />
      </MemoryRouter>
    </ThemeProvider>
  );

const renderHeaderOnRoute = (path: string): ReturnType<typeof render> =>
  render(
    <ThemeProvider>
      <MemoryRouter initialEntries={[path]}>
        <AppHeader variant="workspace" />
      </MemoryRouter>
    </ThemeProvider>
  );

const renderHeaderWithProps = (
  props: AppHeaderProps,
  initialPath = '/workspaces'
): ReturnType<typeof render> =>
  render(
    <ThemeProvider>
      <MemoryRouter initialEntries={[initialPath]}>
        <AppHeader {...props} />
      </MemoryRouter>
    </ThemeProvider>
  );

describe('AppHeader', () => {
  it('hides the settings button when requested', () => {
    renderHeader(true);

    expect(screen.queryByRole('button', { name: 'Settings' })).not.toBeInTheDocument();
  });

  it('shows the settings button on the home route', () => {
    renderHeader(false, '/workspaces');

    expect(screen.getByRole('button', { name: 'Settings' })).toBeInTheDocument();
  });

  it('hides the settings button on a workspace route', () => {
    renderHeaderOnRoute('/workspaces/workspace-123');

    expect(screen.queryByRole('button', { name: 'Settings' })).not.toBeInTheDocument();
  });

  it('hides the settings button on a repository route', () => {
    renderHeaderOnRoute('/repos/sample');

    expect(screen.queryByRole('button', { name: 'Settings' })).not.toBeInTheDocument();
  });

  it('hides the settings button on the settings route', () => {
    renderHeaderOnRoute('/settings');

    expect(screen.queryByRole('button', { name: 'Settings' })).not.toBeInTheDocument();
  });

  it('renders sidebar toggle button when onToggleSidebar is provided and reflects sidebarOpen state', async () => {
    const user = userEvent.setup();
    const onToggleSidebar = vi.fn();

    const { rerender } = renderHeaderWithProps({
      variant: 'home',
      sidebarOpen: true,
      onToggleSidebar
    });

    const hideButton = screen.getByRole('button', { name: 'Hide sidebar' });
    expect(hideButton).toHaveAttribute('title', 'Toggle sidebar (⌘B)');

    await user.click(hideButton);
    expect(onToggleSidebar).toHaveBeenCalledTimes(1);

    rerender(
      <ThemeProvider>
        <MemoryRouter initialEntries={['/workspaces']}>
          <AppHeader
            variant="home"
            sidebarOpen={false}
            onToggleSidebar={onToggleSidebar}
          />
        </MemoryRouter>
      </ThemeProvider>
    );

    const showButton = screen.getByRole('button', { name: 'Show sidebar' });
    expect(showButton).toBeInTheDocument();

    await user.click(showButton);
    expect(onToggleSidebar).toHaveBeenCalledTimes(2);
  });

  it('renders command palette trigger button when onOpenCommandPalette is provided', async () => {
    const user = userEvent.setup();
    const onOpenCommandPalette = vi.fn();

    renderHeaderWithProps({
      variant: 'workspace',
      onOpenCommandPalette
    }, '/workspaces/ws-1');

    const trigger = screen.getByRole('button', { name: 'Open command palette' });
    expect(trigger).toHaveAttribute('title', 'Command palette (⌘K)');
    expect(trigger).toHaveTextContent('Search');
    expect(trigger).toHaveTextContent('⌘K');

    await user.click(trigger);
    expect(onOpenCommandPalette).toHaveBeenCalledTimes(1);
  });
});
