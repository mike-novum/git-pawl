import type { StorybookConfig } from '@storybook/react-vite';
import tailwindcss from '@tailwindcss/vite';
import { mergeConfig } from 'vite';
import { defineConfig } from 'vite';
import { resolve } from 'node:path';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: [],
  framework: {
    name: '@storybook/react-vite',
    options: {}
  },
  typescript: {
    check: false
  },
  viteFinal: async (viteConfig) => {
    return mergeConfig(
      viteConfig,
      defineConfig({
        plugins: [tailwindcss()],
        resolve: {
          alias: {
            '@': resolve(__dirname, '../src'),
            '@electron': resolve(__dirname, '../electron')
          }
        }
      })
    );
  }
};

export default config;