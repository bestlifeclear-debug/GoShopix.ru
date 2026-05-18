import { z } from 'zod';

const nodeEnvSchema = z.enum(['development', 'test', 'staging', 'production']);

const envSchema = z.object({
  NODE_ENV: nodeEnvSchema.default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  JWT_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGIN: z.string().url().optional(),
  API_PUBLIC_URL: z.string().url().optional(),
  SENTRY_DSN: z.string().url().optional().or(z.literal('')),
  SENTRY_ENVIRONMENT: z.string().optional(),
  SENTRY_TRACES_SAMPLE_RATE: z.coerce.number().min(0).max(1).default(0.1),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  JOBS_ENABLED: z
    .enum(['true', 'false'])
    .default(process.env.VERCEL === '1' ? 'false' : 'true')
    .transform((v) => v === 'true'),
});

export type AppConfig = z.infer<typeof envSchema> & {
  isDevelopment: boolean;
  isTest: boolean;
  isStaging: boolean;
  isProduction: boolean;
};

let cached: AppConfig | null = null;

const catalogEnvSchema = z.object({
  DATABASE_URL: z.string().min(1),
});

export type EnvCheckResult = {
  ok: boolean;
  missing: string[];
  message: string;
};

export function checkEnv(options?: { requireJwt?: boolean }): EnvCheckResult {
  const requireJwt = options?.requireJwt ?? true;
  const missing: string[] = [];

  if (!process.env.DATABASE_URL?.trim()) {
    missing.push('DATABASE_URL');
  }

  if (requireJwt) {
    const secret = process.env.JWT_SECRET?.trim() ?? '';
    if (!secret) {
      missing.push('JWT_SECRET');
    } else if (secret.length < 16) {
      missing.push('JWT_SECRET (минимум 16 символов)');
    }
  }

  if (missing.length > 0) {
    const message = `Invalid environment configuration: ${missing.join(', ')}`;
    return { ok: false, missing, message };
  }

  return { ok: true, missing: [], message: '' };
}

export function formatEnvSetupHint(missing: string[]): string {
  const list = missing.join(', ');
  if (process.env.VERCEL === '1') {
    return `Сервер не настроен: добавьте ${list} в Vercel → Project → Settings → Environment Variables (Production), затем Redeploy`;
  }
  return `Сервер не настроен: задайте ${list} в .env в корне проекта`;
}

export function loadConfig(): AppConfig {
  if (cached) return cached;

  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const check = checkEnv();
    const message =
      check.message ||
      parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
    throw new Error(message.startsWith('Invalid') ? message : `Invalid environment configuration: ${message}`);
  }

  const env = parsed.data;
  cached = {
    ...env,
    SENTRY_DSN: env.SENTRY_DSN || undefined,
    isDevelopment: env.NODE_ENV === 'development',
    isTest: env.NODE_ENV === 'test',
    isStaging: env.NODE_ENV === 'staging',
    isProduction: env.NODE_ENV === 'production',
  };
  return cached;
}

export function loadCatalogConfig(): { DATABASE_URL: string } {
  const parsed = catalogEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const check = checkEnv({ requireJwt: false });
    throw new Error(check.message || 'Invalid environment configuration: DATABASE_URL');
  }
  return parsed.data;
}

export function resetConfigCache(): void {
  cached = null;
}
