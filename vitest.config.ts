import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['__tests__/**/*.test.ts'],
    exclude: [
      'node_modules/**',
      '.claude/**',
      'tests/**', // Playwright E2E, not Vitest
    ],
    // Coverage target: only the financial core, not UI components
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/lib/financial-engine.ts', 'src/lib/export-helpers.ts'],
      thresholds: {
        lines: 90,
        branches: 85,
        functions: 90,
        statements: 90,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
