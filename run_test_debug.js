import { execSync } from 'child_process';
try {
  const out = execSync('npx vitest run __tests__/unit/daily-orchestrator.test.ts', { encoding: 'utf-8', stdio: 'pipe' });
  console.log(out);
} catch (e) {
  console.log("STDOUT:", e.stdout);
  console.log("STDERR:", e.stderr);
}
