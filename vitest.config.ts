import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./client/src/__tests__/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'dist/',
        'coverage/',
        '**/*.d.ts',
        '**/*.config.{js,ts}',
        '**/vite.config.ts',
        '**/vitest.config.ts',
        'client/src/__tests__/**',
        'server/__tests__/**',
        'client/src/components/ui/**', // Exclude shadcn components
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        '.env*',
        'Dockerfile*',
        'docker-compose*',
        '*.md',
      ],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70,
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './client/src'),
      '@db': resolve(__dirname, './db'),
    },
  },
});
