import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import type { FC } from 'react';
import { HashRouter } from 'react-router-dom';

import { ThemeProvider } from '@/shared/lib/theme';

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
        <HashRouter>{children}</HashRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
};
