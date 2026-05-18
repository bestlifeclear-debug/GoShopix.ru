import { loadConfig } from '../config/env.js';

/** Origins для CORS / CSRF (Vercel preview + production). */
export function collectAllowedOrigins(): string[] {
  const config = loadConfig();
  const origins = new Set<string>();

  if (config.CORS_ORIGIN) origins.add(config.CORS_ORIGIN);
  if (config.API_PUBLIC_URL) origins.add(config.API_PUBLIC_URL);

  if (process.env.VERCEL_URL) origins.add(`https://${process.env.VERCEL_URL}`);
  if (process.env.VERCEL_BRANCH_URL) origins.add(process.env.VERCEL_BRANCH_URL);
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    origins.add(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`);
  }

  return [...origins];
}

export function isAllowedRequestOrigin(origin: string | undefined): boolean {
  if (!origin) return false;

  const allowed = collectAllowedOrigins();
  if (allowed.some((base) => origin === base || origin.startsWith(`${base}/`))) {
    return true;
  }

  // Любой preview/production деплой на Vercel
  if (/^https:\/\/[\w.-]+\.vercel\.app$/i.test(origin)) {
    return true;
  }

  return false;
}
