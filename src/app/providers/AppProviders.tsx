import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import type { FC } from 'react';
import { HashRouter } from 'react-router-dom';

import { ThemeProvider } from '@/shared/lib/theme';
import { Toast } from '@/shared/ui';

import type { AppProvidersProps } from './types';

export const AppProviders: FC<AppProvidersProps> = ({ children }) => {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false
          }
        }
      })
  );

  return (
    <QueryClientProvider client={client}>
      <ThemeProvider>
        <Toast.Provider>
          <HashRouter>{children}</HashRouter>
          <Toast.Portal>
            <Toast.Viewport />
            <Toast.List />
          </Toast.Portal>
        </Toast.Provider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};
