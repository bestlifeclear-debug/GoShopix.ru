import type { VercelRequest, VercelResponse } from '@vercel/node';

/** Readiness probe — checks DB without loading the full Express app. */
export default async function handler(_req: VercelRequest, res: VercelResponse): Promise<void> {
  let database: 'ok' | 'error' = 'ok';

  try {
    await import('../../server/dist/load-env.js');
    const { prisma } = await import('../../server/dist/lib/prisma.js');
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    database = 'error';
  }

  const ok = database === 'ok';
  res.status(ok ? 200 : 503).json({
    success: ok,
    data: {
      status: ok ? 'ok' : 'degraded',
      service: 'goshopix-api',
      timestamp: new Date().toISOString(),
      checks: { database },
    },
  });
}
