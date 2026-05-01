import { describe, it, expect } from 'vitest';

describe('Smoke Tests', () => {
  it('should have valid globals.css', async () => {
    const css = await import('@/app/globals.css' as any).catch(() => null);
    const fs = await import('fs');
    expect(fs.existsSync('src/app/globals.css')).toBe(true);
  });

  it('should have valid prisma schema', async () => {
    const fs = await import('fs');
    expect(fs.existsSync('prisma/schema.prisma')).toBe(true);
  });

  it('should have financial engine', async () => {
    const engine = await import('@/lib/financial-engine');
    expect(engine).toBeDefined();
  });

  it('should export computeSpendDecision', async () => {
    const engine = await import('@/lib/financial-engine');
    expect(typeof engine.computeSpendDecision).toBe('function');
  });

  it('should export computeMonthlySummary', async () => {
    const engine = await import('@/lib/financial-engine');
    expect(typeof engine.computeMonthlySummary).toBe('function');
  });

  it('should export computeWeeklyForecast', async () => {
    const engine = await import('@/lib/financial-engine');
    expect(typeof engine.computeWeeklyForecast).toBe('function');
  });

  it('should have valid package.json', async () => {
    const pkg = await import('@/../package.json' as any);
    expect(pkg.name).toBeDefined();
    expect(pkg.version).toBeDefined();
  });

  it('should have Next.js as dependency', async () => {
    const pkg = await import('@/../package.json' as any);
    expect(pkg.dependencies.next || pkg.devDependencies?.next).toBeDefined();
  });
});
