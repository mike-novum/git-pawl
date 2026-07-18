import type { FC } from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { ThemeToggle } from '@/shared/ui/theme-toggle';

type SwatchProps = {
  readonly label: string;
  readonly className: string;
};

const Swatch: FC<SwatchProps> = ({ label, className }) => (
  <div className="border-border bg-card flex flex-col gap-2 rounded-md border p-3">
    <span className="text-muted-foreground text-xs">{label}</span>
    <span className={`h-10 w-full rounded-sm ${className}`} />
  </div>
);

type ThemePreviewProps = {
  readonly mode: 'dark' | 'light';
};

const ThemePreview: FC<ThemePreviewProps> = ({ mode }) => (
  <div
    data-theme={mode}
    className="bg-background text-foreground flex flex-col gap-4 rounded-lg border border-[color:var(--color-border)] p-6"
  >
    <header className="flex items-center justify-between">
      <h2 className="text-lg font-semibold">{mode === 'dark' ? 'Dark theme' : 'Light theme'}</h2>
      <ThemeToggle />
    </header>

    <div className="grid grid-cols-2 gap-3">
      <Swatch label="background" className="bg-background" />
      <Swatch label="foreground" className="bg-foreground" />
      <Swatch label="primary" className="bg-primary" />
      <Swatch label="secondary" className="bg-secondary" />
      <Swatch label="muted" className="bg-muted" />
      <Swatch label="accent" className="bg-accent" />
      <Swatch label="destructive" className="bg-destructive" />
      <Swatch label="border" className="bg-border" />
    </div>

    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        className="bg-primary text-primary-foreground rounded-md px-3 py-1.5 text-sm"
      >
        Primary
      </button>
      <button
        type="button"
        className="bg-secondary text-secondary-foreground rounded-md px-3 py-1.5 text-sm"
      >
        Secondary
      </button>
      <button
        type="button"
        className="bg-destructive text-destructive-foreground rounded-md px-3 py-1.5 text-sm"
      >
        Destructive
      </button>
    </div>
  </div>
);

const meta: Meta = {
  title: 'UI/Theme',
  parameters: {
    layout: 'fullscreen'
  }
};

export default meta;

type Story = StoryObj;

export const Dark: Story = {
  render: () => <ThemePreview mode="dark" />
};

export const Light: Story = {
  render: () => <ThemePreview mode="light" />
};

export const SideBySideAll: Story = {
  render: () => (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <ThemePreview mode="dark" />
      <ThemePreview mode="light" />
    </div>
  )
};
