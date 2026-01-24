// vitest.config.ts — CLEAN & SIMPLE (Storybook 10 + Vitest)
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  test: {
    globals: true,
    css: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests'], // Your existing setup

    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/main.tsx', 'src/vite-env.d.ts'],
    },

    // NO 'projects' array — addon-vitest handles Storybook tests automatically
    // This eliminates the "not unique" error
    exclude: [
      'node_modules',
      'dist',
      '**/*.stories.{ts,tsx}', // Exclude stories from unit tests
    ],
  },
});