import type { Decorator, Preview } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import '../src/app/styles/globals.css';

import { ThemeProvider } from '@/shared/lib/theme';

import { ThemeRoot } from './ThemeRoot';
import type { StorybookTheme } from './types';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false
    }
  }
});

const withTheme: Decorator = (Story, context) => {
  const globals = context.globals as { theme?: StorybookTheme };
  const mode = globals.theme ?? 'dark';

  return (
    <ThemeProvider>
      <ThemeRoot mode={mode}>
        <Story />
      </ThemeRoot>
    </ThemeProvider>
  );
};

const withQueryClient: Decorator = (Story) => (
  <QueryClientProvider client={queryClient}>
    <Story />
  </QueryClientProvider>
);

const preview: Preview = {
  decorators: [withTheme, withQueryClient],
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Тема оформления',
      defaultValue: 'dark',
      toolbar: {
        icon: 'circlehollow',
        title: 'Theme',
        items: [
          { value: 'dark', title: 'Dark' },
          { value: 'light', title: 'Light' }
        ],
        dynamicTitle: true
      }
    }
  },
  parameters: {
    backgrounds: {
      disable: false,
      default: 'dark',
      values: [
        { name: 'dark', value: 'oklch(0.18 0.02 270)' },
        { name: 'light', value: 'oklch(0.99 0.005 270)' }
      ]
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/
      }
    },
    options: {
      storySort: {
        order: ['UI', 'shared', 'shared/ui', 'shared/lib', 'Pages', '*']
      }
    }
  },
  initialGlobals: {
    theme: 'dark'
  }
};

export default preview;
