import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['__tests__/**/*.test.{ts,tsx}'],
    exclude: [
      'node_modules/**',
      '.claude/**',
      'tests/**', // Playwright E2E, not Vitest
      'dist/**',
      '.next/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      thresholds: {
        lines: 35,
        branches: 30,
        functions: 40,
        statements: 35,
      },
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/types/**',
        '**/*.d.ts',
        'src/app/layout.tsx',
        '**/node_modules/**',
        'src/**/page.tsx',
        'src/**/page.ts',
        'src/components/**',
        'src/hooks/**',
        '**/*.example.ts',
        'src/middleware.ts',
        'src/app/admin/**',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
