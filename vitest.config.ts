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
      'dist/**',
      '.next/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json', 'lcov'],
      all: true,
      include: [
        'src/domain/**/*.ts',
        'src/application/**/*.ts',
        'src/infrastructure/**/*.ts',
        'src/lib/**/*.ts',
      ],
      exclude: [
        'src/**/*.test.ts',
        'src/**/*.spec.ts',
        'src/**/*.types.ts',
        'src/**/index.ts',
        'node_modules/**',
      ],
      thresholds: {
        lines: 100,
        branches: 95,
        functions: 100,
        statements: 100,
      },
      // Report any uncovered lines
      reportOnFailure: true,
      lines: 100,
      functions: 100,
      branches: 95,
      statements: 100,
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
