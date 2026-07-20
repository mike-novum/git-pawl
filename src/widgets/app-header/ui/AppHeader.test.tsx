import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ThemeProvider } from '@/shared/lib/theme';

import { AppHeader } from './AppHeader';

const renderHeader = (hideSettings = false): void => {
  render(
    <ThemeProvider>
      <AppHeader variant="home" hideSettings={hideSettings} />
    </ThemeProvider>
  );
};

describe('AppHeader', () => {
  it('hides the settings button when requested', () => {
    renderHeader(true);

    expect(screen.queryByRole('button', { name: 'Settings' })).not.toBeInTheDocument();
  });

  it('shows the settings button by default', () => {
    renderHeader();

    expect(screen.getByRole('button', { name: 'Settings' })).toBeInTheDocument();
  });
});
