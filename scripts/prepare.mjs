/** Husky только локально; на Vercel/CI prepare не должен падать. */
import { execSync } from 'node:child_process';

if (process.env.CI || process.env.VERCEL || process.env.HUSKY === '0') {
  process.exit(0);
}

try {
  execSync('husky', { stdio: 'inherit' });
} catch {
  console.warn('husky: skip (not installed)');
}
