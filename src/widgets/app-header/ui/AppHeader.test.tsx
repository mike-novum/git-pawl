import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { ThemeProvider } from '@/shared/lib/theme';

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
});