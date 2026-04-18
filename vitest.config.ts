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
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: [
        'src/lib/financial-engine.ts',
        'src/lib/export-helpers.ts',
        'src/lib/format-errors.ts',
        'src/lib/date-utils.ts',
        'src/lib/validations.ts',
      ],
      thresholds: {
        lines: 90,
        branches: 80,
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
