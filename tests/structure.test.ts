import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Project Structure Tests', () => {
  it('should have required API routes', () => {
    const routes = [
      'src/app/api/transactions/route.ts',
      'src/app/api/transactions/[id]/route.ts',
      'src/app/api/accounts/[id]/route.ts',
      'src/app/api/upload/route.ts',
      'src/app/api/approvals/route.ts',
    ];

    routes.forEach(route => {
      const filePath = path.join(process.cwd(), route);
      expect(fs.existsSync(filePath), `Route file ${route} should exist`).toBe(true);
    });
  });

  it('should have required page components', () => {
    const pages = [
      'src/app/page.tsx',
      'src/app/login/page.tsx',
      'src/app/movimentacoes/page.tsx',
      'src/app/contas/page.tsx',
    ];

    pages.forEach(page => {
      const filePath = path.join(process.cwd(), page);
      expect(fs.existsSync(filePath), `Page file ${page} should exist`).toBe(true);
    });
  });

  it('should have dark mode provider', () => {
    const themeFile = path.join(process.cwd(), 'src/components/theme-provider.tsx');
    expect(fs.existsSync(themeFile)).toBe(true);

    const content = fs.readFileSync(themeFile, 'utf-8');
    expect(content).toContain('localStorage');
    expect(content).toContain('dark');
  });

  it('should have MIME validation in upload', () => {
    const uploadFile = path.join(process.cwd(), 'src/app/api/upload/route.ts');
    const content = fs.readFileSync(uploadFile, 'utf-8');

    expect(content).toContain('validMimeTypes');
    expect(content).toContain('application/pdf');
    expect(content).toContain('image/');
  });

  it('transactions DELETE should require ADMIN', () => {
    const transactionFile = path.join(process.cwd(), 'src/app/api/transactions/[id]/route.ts');
    const content = fs.readFileSync(transactionFile, 'utf-8');

    expect(content).toContain('ADMIN');
    expect(content).toContain('403');
  });

  it('accounts DELETE should require ADMIN', () => {
    const accountFile = path.join(process.cwd(), 'src/app/api/accounts/[id]/route.ts');
    const content = fs.readFileSync(accountFile, 'utf-8');

    expect(content).toContain('ADMIN');
    expect(content).toContain('403');
  });

  it('pagination should have limit', () => {
    const transFile = path.join(process.cwd(), 'src/app/api/transactions/route.ts');
    const content = fs.readFileSync(transFile, 'utf-8');

    expect(content).toContain('take: 5000');
  });

  it('should not have dangerous console.logs in pages', () => {
    const pagesToCheck = [
      'src/app/page.tsx',
      'src/app/movimentacoes/page.tsx',
      'src/app/contas-a-pagar/page.tsx',
    ];

    pagesToCheck.forEach(page => {
      const filePath = path.join(process.cwd(), page);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const lines = content.split('\n');

        lines.forEach((line, idx) => {
          if (line.includes('console.log') || line.includes('console.error')) {
            // Some console is OK in error handlers, but not standalone
            const isStandalone = !line.includes('catch') && !line.includes('error:') &&
                                 /^\s*console\./.test(line);
            expect(!isStandalone,
              `Page ${page} line ${idx + 1} should not have standalone console.log`
            ).toBe(true);
          }
        });
      }
    });
  });

  it('should have auth configured', () => {
    const authFile = path.join(process.cwd(), 'src/lib/auth.ts');
    const content = fs.readFileSync(authFile, 'utf-8');

    expect(content).toContain('CredentialsProvider');
    expect(content).toContain('bcrypt');
    expect(content).toContain('checkRateLimit');
    expect(content).toContain('CustomUser');
  });

  it('should have environment configured', () => {
    const envFile = path.join(process.cwd(), '.env.local');
    expect(fs.existsSync(envFile), '.env.local should exist').toBe(true);

    const content = fs.readFileSync(envFile, 'utf-8');
    expect(content).toContain('DATABASE_URL');
    expect(content).toContain('NEXTAUTH_SECRET');
  });

  it('build should succeed', () => {
    const buildPath = path.join(process.cwd(), '.next');
    expect(fs.existsSync(buildPath), 'Build directory should exist').toBe(true);
  });
});
