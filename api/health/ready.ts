import type { VercelRequest, VercelResponse } from '@vercel/node';

/** Readiness probe — env + DB without loading the full Express app. */
export default async function handler(_req: VercelRequest, res: VercelResponse): Promise<void> {
  let env: 'ok' | 'error' = 'ok';
  let database: 'ok' | 'error' = 'error';
  let missing: string[] = [];

  try {
    await import('../../server/dist/load-env.js');
    const { checkEnv } = await import('../../server/dist/config/env.js');
    const envCheck = checkEnv();
    missing = envCheck.missing;
    if (!envCheck.ok) {
      env = 'error';
    } else {
      const { prisma } = await import('../../server/dist/lib/prisma.js');
      await prisma.$queryRaw`SELECT 1`;
      database = 'ok';
    }
  } catch {
    if (env === 'ok') {
      database = 'error';
    }
  }

  const ok = env === 'ok' && database === 'ok';
  res.status(ok ? 200 : 503).json({
    success: ok,
    data: {
      status: ok ? 'ok' : 'degraded',
      service: 'goshopix-api',
      timestamp: new Date().toISOString(),
      checks: { env, database },
      ...(missing.length > 0 ? { missing } : {}),
    },
  });
}
