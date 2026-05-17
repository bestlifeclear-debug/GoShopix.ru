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
    .default('true')
    .transform((v) => v === 'true'),
});

export type AppConfig = z.infer<typeof envSchema> & {
  isDevelopment: boolean;
  isTest: boolean;
  isStaging: boolean;
  isProduction: boolean;
};

let cached: AppConfig | null = null;

export function loadConfig(): AppConfig {
  if (cached) return cached;

  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const message = parsed.error.issues
      .map((i) => `${i.path.join('.')}: ${i.message}`)
      .join('; ');
    throw new Error(`Invalid environment configuration: ${message}`);
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

export function resetConfigCache(): void {
  cached = null;
}
