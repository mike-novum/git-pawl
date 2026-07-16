import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { AppProviders } from '@/app/providers';
import { useAppStore } from '@/app/store';
import '@/app/styles/globals.css';

import { App } from './App';

const PERSIST_KEY = 'git-pawl.app';

const bootstrapTheme = (): void => {
  if (typeof window === 'undefined') return;

  const persisted = window.localStorage.getItem(PERSIST_KEY);
  if (persisted !== null) return;

  const media = window.matchMedia?.('(prefers-color-scheme: dark)');
  const prefersDark = media?.matches ?? true;

  useAppStore.getState().setTheme(prefersDark ? 'dark' : 'light');
};

bootstrapTheme();

const container = document.getElementById('root');

if (!container) {
  throw new Error('Root element #root not found');
}

createRoot(container).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>
);
