/** Origins для CORS / CSRF (Vercel preview + production). Без loadConfig — не ломаем CORS при ошибке env. */
export function collectAllowedOrigins(): string[] {
  const origins = new Set<string>();

  if (process.env.CORS_ORIGIN) origins.add(process.env.CORS_ORIGIN);
  if (process.env.API_PUBLIC_URL) origins.add(process.env.API_PUBLIC_URL);

  if (process.env.VERCEL_URL) origins.add(`https://${process.env.VERCEL_URL}`);
  if (process.env.VERCEL_BRANCH_URL) origins.add(process.env.VERCEL_BRANCH_URL);
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    origins.add(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`);
  }

  return [...origins];
}

export function isAllowedRequestOrigin(origin: string | undefined): boolean {
  if (!origin) return false;

  // Сначала Vercel — не зависит от JWT_SECRET / loadConfig
  if (/^https:\/\/[\w.-]+\.vercel\.app$/i.test(origin)) {
    return true;
  }

  const allowed = collectAllowedOrigins();
  return allowed.some((base) => origin === base || origin.startsWith(`${base}/`));
}
